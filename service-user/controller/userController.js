const userService = require('../services/userService')

// Ajouter un utilisateur (admin)
async function add(req, res) {
  try {
    const user = await userService.createUser(req.body)
    res.status(201).json({ message: "Utilisateur ajouté avec succès", user })
  } catch (err) {
    res.status(400).json({ error: "Erreur lors de l'ajout", details: err.message })
  }
}

// Afficher tous les utilisateurs (avec pagination / filtres / recherche)
async function showAll(req, res) {
  try {
    // Parse and sanitize query params
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10
    const sort = req.query.sort || '-date_creation'
    const sortBy = req.query.sortBy
    const sortDir = req.query.sortDir
    const role = req.query.role
    const q = req.query.q
    const from = req.query.from
    const to = req.query.to
    const fields = req.query.fields
    const specialite = req.query.specialite

    const result = await userService.getUsers({ page, limit, sort, role, q, sortBy, sortDir, from, to, fields, specialite })
    res.status(200).json({ success: true, ...result })
  } catch (err) {
    res.status(500).json({ error: "Erreur de récupération", details: err.message })
  }
}

// Afficher un utilisateur par ID
async function showById(req, res) {
  try {
    const user = await userService.getById(req.params.id)
    if (!user) return res.status(404).json({ error: "Utilisateur non trouvé" })
    res.status(200).json(user)
  } catch (err) {
    res.status(500).json({ error: "Erreur de récupération" })
  }
}

// Afficher par nom d'utilisateur
async function showByUsername(req, res) {
  try {
    const user = await userService.getByUsername(req.params.username)
    if (!user) return res.status(404).json({ error: "Utilisateur non trouvé" })
    res.status(200).json(user)
  } catch (err) {
    res.status(500).json({ error: "Erreur de récupération" })
  }
}

// Afficher par rôle
async function showByRole(req, res) {
  try {
    const users = await userService.getByRole(req.params.role)
    res.status(200).json(users)
  } catch (err) {
    res.status(500).json({ error: "Erreur de récupération" })
  }
}

// Supprimer un utilisateur
async function deleteUser(req, res) {
  try {
    await userService.deleteUser(req.params.id)
    res.status(200).json({ message: "Utilisateur supprimé avec succès" })
  } catch (err) {
    res.status(500).json({ error: "Erreur de suppression" })
  }
}

// Modifier un utilisateur
async function updateUser(req, res) {
  try {
    const user = await userService.updateUser(req.params.id, req.body)
    res.status(200).json({ message: "Utilisateur modifié avec succès", user })
  } catch (err) {
    res.status(500).json({ error: "Erreur de modification" })
  }
}

// Statistiques agrégées des utilisateurs (admin)
async function getStats(req, res) {
  try {
    const { role, q, from, to, specialite } = req.query
    const stats = await userService.getStats({ role, q, from, to, specialite })
    res.status(200).json({ success: true, ...stats })
  } catch (err) {
    res.status(500).json({ error: "Erreur lors de la récupération des statistiques", details: err.message })
  }
}

// Export CSV des utilisateurs filtrés (admin)
async function exportUsers(req, res) {
  try {
    const format = (req.query.format || 'csv').toLowerCase()
    const exportOptions = {
      role: req.query.role,
      q: req.query.q,
      from: req.query.from,
      to: req.query.to,
      specialite: req.query.specialite,
      fields: req.query.fields,
      sort: req.query.sort,
      sortBy: req.query.sortBy,
      sortDir: req.query.sortDir,
    }

    if (format === 'pdf') {
      const { buffer, filename } = await userService.exportUsersPdf(exportOptions)
      res.setHeader('Content-Type', 'application/pdf')
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
      return res.status(200).send(buffer)
    }

    const { csv, filename } = await userService.exportUsers(exportOptions)

    res.setHeader('Content-Type', 'text/csv; charset=utf-8')
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
    res.status(200).send(csv)
  } catch (err) {
    res.status(500).json({ error: "Erreur lors de l'export", details: err.message })
  }
}

module.exports = {
  add,
  showAll,
  showById,
  showByUsername,
  showByRole,
  deleteUser,
  updateUser,
  getStats,
  exportUsers,
}