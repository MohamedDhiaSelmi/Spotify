require('dotenv').config()
const mongoose = require('mongoose')
const User = require('../model/user')
const dbConfig = require('../config/dbconnection.json')

async function deleteAllUsers() {
  try {
    console.log('🔌 Connexion à la base de données...')
    await mongoose.connect(dbConfig.url)
    console.log('✅ Connecté à MongoDB\n')

    console.log('📊 Comptage des utilisateurs...')
    const countBefore = await User.countDocuments()
    console.log(`   Nombre d'utilisateurs avant suppression: ${countBefore}\n`)

    if (countBefore === 0) {
      console.log('ℹ️  Aucun utilisateur à supprimer.')
      await mongoose.disconnect()
      process.exit(0)
    }

    // Demander confirmation
    const readline = require('readline')
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    })

    rl.question(`⚠️  Êtes-vous sûr de vouloir supprimer TOUS les ${countBefore} utilisateur(s)? (oui/non): `, async (answer) => {
      if (answer.toLowerCase() !== 'oui' && answer.toLowerCase() !== 'o' && answer.toLowerCase() !== 'yes' && answer.toLowerCase() !== 'y') {
        console.log('\n❌ Suppression annulée.')
        rl.close()
        await mongoose.disconnect()
        process.exit(0)
      }

      console.log('\n🗑️  Suppression en cours...')
      
      try {
        const result = await User.deleteMany({})
        console.log(`✅ ${result.deletedCount} utilisateur(s) supprimé(s) avec succès!\n`)

        const countAfter = await User.countDocuments()
        console.log(`📊 Nombre d'utilisateurs après suppression: ${countAfter}`)
        console.log('\n✨ Base de données nettoyée!')
        console.log('💡 Vous pouvez maintenant créer de nouveaux utilisateurs avec les mêmes emails.\n')

      } catch (error) {
        console.error('❌ Erreur lors de la suppression:', error.message)
      } finally {
        rl.close()
        await mongoose.disconnect()
        process.exit(0)
      }
    })
  } catch (error) {
    console.error('❌ Erreur de connexion:', error.message)
    process.exit(1)
  }
}

deleteAllUsers()

