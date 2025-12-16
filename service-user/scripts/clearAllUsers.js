require('dotenv').config()
const mongoose = require('mongoose')
const User = require('../model/user')
const dbConfig = require('../config/dbconnection.json')

async function clearAllUsers() {
  try {
    console.log('🔌 Connexion à la base de données...')
    await mongoose.connect(dbConfig.url)
    console.log('✅ Connecté à MongoDB\n')

    console.log('📊 Comptage des utilisateurs...')
    const countBefore = await User.countDocuments()
    console.log(`   Nombre d'utilisateurs: ${countBefore}\n`)

    if (countBefore === 0) {
      console.log('ℹ️  Aucun utilisateur à supprimer.')
      await mongoose.disconnect()
      process.exit(0)
    }

    console.log('🗑️  Suppression de tous les utilisateurs...')
    const result = await User.deleteMany({})
    
    console.log(`✅ ${result.deletedCount} utilisateur(s) supprimé(s) avec succès!\n`)

    const countAfter = await User.countDocuments()
    console.log(`📊 Nombre d'utilisateurs restants: ${countAfter}`)
    console.log('\n✨ Base de données nettoyée!')
    console.log('💡 Vous pouvez maintenant créer de nouveaux utilisateurs avec les mêmes emails.\n')

    await mongoose.disconnect()
    process.exit(0)
  } catch (error) {
    console.error('❌ Erreur:', error.message)
    await mongoose.disconnect()
    process.exit(1)
  }
}

clearAllUsers()

