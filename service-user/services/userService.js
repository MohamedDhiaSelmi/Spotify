const mongoose = require('mongoose')
const PDFDocument = require('pdfkit')
const User = require('../model/user')

const ALLOWED_SORT_FIELDS = ['username', 'email', 'role', 'date_creation', 'cin', 'specialite']
const ALLOWED_PROJECTION_FIELDS = ['username', 'email', 'role', 'cin', 'specialite', 'date_creation', '_id']
const DEFAULT_EXPORT_FIELDS = ['_id', 'username', 'email', 'role', 'cin', 'specialite', 'date_creation']

function buildSort(sort, sortBy, sortDir, useTextScore) {
  if (useTextScore) {
    return { score: { $meta: 'textScore' }, date_creation: -1 }
  }

  if (sortBy) {
    const dir = sortDir === 'asc' ? 1 : -1
    if (ALLOWED_SORT_FIELDS.includes(sortBy)) {
      return { [sortBy]: dir }
    }
  }

  if (typeof sort === 'string' && sort.length > 0) {
    const firstChar = sort[0]
    const field = firstChar === '-' ? sort.slice(1) : sort
    if (ALLOWED_SORT_FIELDS.includes(field)) {
      return { [field]: firstChar === '-' ? -1 : 1 }
    }
  }

  return { date_creation: -1 }
}

function buildProjection(fields, includeScore) {
  if (!fields) {
    const projection = { password: 0, refreshTokens: 0 }
    if (includeScore) {
      projection.score = { $meta: 'textScore' }
    }
    return projection
  }

  const requested = fields.split(',').map((item) => item.trim()).filter(Boolean)
  if (requested.length === 0) {
    const projection = { password: 0, refreshTokens: 0 }
    if (includeScore) {
      projection.score = { $meta: 'textScore' }
    }
    return projection
  }

  const projection = {}
  requested.forEach((field) => {
    if (ALLOWED_PROJECTION_FIELDS.includes(field)) {
      projection[field] = 1
    }
  })

  if (includeScore) {
    projection.score = { $meta: 'textScore' }
  }

  if (Object.keys(projection).length === 0) {
    projection.password = 0
    projection.refreshTokens = 0
  }

  return projection
}

function buildFilters({ role, q, from, to, specialite }) {
  const filters = {}
  let useTextSearch = false

  if (role) {
    filters.role = role
  }

  if (specialite) {
    filters.specialite = { $regex: specialite, $options: 'i' }
  }

  if (from || to) {
    filters.date_creation = {}
    if (from) {
      const fromDate = new Date(from)
      if (!Number.isNaN(fromDate.getTime())) {
        filters.date_creation.$gte = fromDate
      }
    }
    if (to) {
      const toDate = new Date(to)
      if (!Number.isNaN(toDate.getTime())) {
        filters.date_creation.$lte = toDate
      }
    }
    if (Object.keys(filters.date_creation).length === 0) {
      delete filters.date_creation
    }
  }

  if (q) {
    filters.$text = { $search: q }
    useTextSearch = true
  }

  return { filters, useTextSearch }
}

function pickExportFields(fields) {
  if (!fields) {
    return DEFAULT_EXPORT_FIELDS
  }

  const requested = fields.split(',').map((item) => item.trim()).filter(Boolean)
  const valid = requested.filter((field) => ALLOWED_PROJECTION_FIELDS.includes(field))

  return valid.length > 0 ? Array.from(new Set(valid)) : DEFAULT_EXPORT_FIELDS
}

function formatCsvValue(value) {
  if (value === null || value === undefined) {
    return ''
  }

  if (value instanceof Date) {
    return value.toISOString()
  }

  const str = String(value)
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`
  }

  return str
}

function formatPlainValue(value) {
  if (value === null || value === undefined) {
    return ''
  }

  if (value instanceof Date) {
    return value.toISOString()
  }

  return String(value)
}

async function createUser(payload) {
  const user = new User(payload)
  return user.save()
}

async function getUsers(options = {}) {
  const {
    page = 1,
    limit = 10,
    sort,
    sortBy,
    sortDir,
    role,
    q,
    from,
    to,
    fields,
    specialite,
    stats: statsFlag,
  } = options

  const safePage = Math.max(parseInt(page, 10) || 1, 1)
  const safeLimit = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 100)
  const skip = (safePage - 1) * safeLimit

  const { filters, useTextSearch } = buildFilters({ role, q, from, to, specialite })
  const projection = buildProjection(fields, useTextSearch)
  const sortOption = buildSort(sort, sortBy, sortDir, useTextSearch)

  const query = User.find(filters).select(projection).sort(sortOption).skip(skip).limit(safeLimit).lean()

  const totalPromise = User.countDocuments(filters)
  const usersPromise = query.exec()

  const promises = [usersPromise, totalPromise]

  if (statsFlag === true || statsFlag === 'true') {
    const statsPromise = User.aggregate([
      { $match: filters },
      { $group: { _id: '$role', count: { $sum: 1 } } },
      {
        $project: {
          _id: 0,
          role: '$_id',
          count: 1,
        },
      },
      { $sort: { role: 1 } },
    ])
    promises.push(statsPromise)
  }

  const results = await Promise.all(promises)
  const users = results[0]
  const total = results[1]
  const stats = results[2]

  const totalPages = Math.max(Math.ceil(total / safeLimit), 1)

  return {
    users,
    pagination: {
      page: safePage,
      limit: safeLimit,
      total,
      totalPages,
      hasNext: safePage < totalPages,
      hasPrev: safePage > 1,
    },
    filtersApplied: {
      role: filters.role || null,
      specialite: specialite || null,
      query: q || null,
      from: from || null,
      to: to || null,
    },
    stats: stats || null,
  }
}

async function getById(id) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return null
  }
  return User.findById(id).select('-password -refreshTokens').lean()
}

async function getByUsername(username) {
  return User.findOne({ username }).select('-password -refreshTokens').lean()
}

async function getByRole(role) {
  return User.find({ role }).select('-password -refreshTokens').lean()
}

async function deleteUser(id) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error('Identifiant invalide')
  }
  await User.findByIdAndDelete(id)
}

async function updateUser(id, updates) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error('Identifiant invalide')
  }

  const user = await User.findById(id)
  if (!user) {
    throw new Error('Utilisateur non trouvé')
  }

  const editableFields = ['username', 'email', 'role', 'cin', 'specialite']
  editableFields.forEach((field) => {
    if (Object.prototype.hasOwnProperty.call(updates, field)) {
      user[field] = updates[field]
    }
  })

  if (updates.password) {
    user.password = updates.password
  }

  return user.save()
}

async function getStats(options = {}) {
  const { role, q, from, to, specialite } = options
  const { filters } = buildFilters({ role, q, from, to, specialite })

  const aggregation = await User.aggregate([
    { $match: filters },
    { $group: { _id: '$role', count: { $sum: 1 } } },
    { $project: { _id: 0, role: '$_id', count: 1 } },
    { $sort: { role: 1 } },
  ])

  const total = aggregation.reduce((sum, item) => sum + item.count, 0)

  return {
    total,
    byRole: aggregation,
    filtersApplied: {
      role: filters.role || null,
      specialite: specialite || null,
      query: q || null,
      from: from || null,
      to: to || null,
    },
  }
}

async function exportUsers(options = {}) {
  const { users, selectedFields } = await fetchUsersForExport(options)

  const headers = selectedFields.join(',')
  const rows = users.map((user) => {
    return selectedFields.map((field) => {
      const value = user[field]
      return formatCsvValue(value)
    }).join(',')
  })

  const csv = [headers, ...rows].join('\n')
  const filename = `users-export-${new Date().toISOString().replace(/[:.]/g, '-')}.csv`

  return { csv, filename }
}

async function exportUsersPdf(options = {}) {
  const { users, selectedFields } = await fetchUsersForExport(options)

  const doc = new PDFDocument({ size: 'A4', margin: 36 })
  const bufferPromise = new Promise((resolve, reject) => {
    const chunks = []
    doc.on('data', (chunk) => chunks.push(chunk))
    doc.on('end', () => resolve(Buffer.concat(chunks)))
    doc.on('error', reject)
  })

  doc.fontSize(18).text('Export des utilisateurs', { align: 'center' })
  doc.moveDown(0.5)
  doc.fontSize(10).fillColor('#555555').text(`Total: ${users.length}`)
  doc.moveDown()

  const headerLabels = selectedFields.map((field) => field.replace(/_/g, ' ').toUpperCase())
  doc.font('Helvetica-Bold').fillColor('#000000')
  doc.text(headerLabels.join(' | '))
  doc.moveDown(0.3)

  doc.font('Helvetica').fillColor('#000000')
  users.forEach((user) => {
    const row = selectedFields.map((field) => formatPlainValue(user[field])).join(' | ')
    doc.text(row)
  })

  doc.end()

  const buffer = await bufferPromise
  const filename = `users-export-${new Date().toISOString().replace(/[:.]/g, '-')}.pdf`

  return { buffer, filename }
}

async function fetchUsersForExport(options = {}) {
  const {
    role,
    q,
    from,
    to,
    specialite,
    fields,
    sort,
    sortBy,
    sortDir,
  } = options

  const { filters, useTextSearch } = buildFilters({ role, q, from, to, specialite })
  const selectedFields = pickExportFields(fields)
  const projection = buildProjection(selectedFields.join(','), useTextSearch)
  const sortOption = buildSort(sort, sortBy, sortDir, useTextSearch)

  const users = await User.find(filters).select(projection).sort(sortOption).lean()

  return { users, selectedFields }
}

module.exports = {
  createUser,
  getUsers,
  getById,
  getByUsername,
  getByRole,
  deleteUser,
  updateUser,
  getStats,
  exportUsers,
  exportUsersPdf,
}

