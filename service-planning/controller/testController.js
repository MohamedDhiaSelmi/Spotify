const UserModel = require('../model/user');


async function addUser(req, res)  {
  console.log('User creation route accessed');
  try {
    const { name, email, password } = req.body
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'name, email and password are required' })
    }

    const user = new UserModel({ name, email, password })
    await user.save()
    return res.status(201).json({ message: 'User created', user })
  } catch (err) {
      console.error('Error creating user:', err)
      // Handle duplicate email error from MongoDB
      if (err && (err.code === 11000 || err.name === 'MongoServerError')) {
        return res.status(409).json({ error: 'Email already exists', details: err.keyValue })
      }
      return res.status(500).json({ error: 'Internal server error' })
  }
}

async function getUsers (req, res) {
  try {
    const users = await UserModel.find()
    return res.status(200).json({ users })
  } catch (err) {
    console.error('Error fetching users:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

async function deleteUser (req, res)  {
  try {
    const result = await UserModel.deleteOne({ name: req.params.name })
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'User not found' })
    }
    return res.status(200).json({ message: 'User deleted' })
  } catch (err) {
    console.error('Error deleting user:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

async function updateUser (req, res) {
  try {
    const { email, password } = req.body
    if (!email && !password) {
      return res.status(400).json({ error: 'At least one of email or password is required to update' })
    }
    const result = await UserModel.updateOne({ name: req.params.name }, { $set: { email, password } })
    if (result.modifiedCount === 0) {
      return res.status(404).json({ error: 'User not found' })
    }
    return res.status(200).json({ message: 'User updated' })
  } catch (err) {
    console.error('Error updating user:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

module.exports = { addUser, getUsers, deleteUser, updateUser }
