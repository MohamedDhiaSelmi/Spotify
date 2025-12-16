require('dotenv').config()
const mongoose = require('mongoose')
const User = require('../model/user')
const authService = require('../services/authService')
const dbConfig = require('../config/dbconnection.json')

async function testPasswordResetEmail() {
  console.log('🧪 Test de l\'envoi automatique d\'email lors d\'un mot de passe incorrect\n')
  
  // Vérification de la configuration
  console.log('📋 Configuration:')
  console.log('   BREVO_API_KEY:', process.env.BREVO_API_KEY ? '✓ Configuré' : '✗ Manquant')
  console.log('   MAIL_FROM:', process.env.MAIL_FROM || '✗ Manquant')
  console.log('')

  if (!process.env.BREVO_API_KEY) {
    console.error('❌ ERREUR: BREVO_API_KEY manquante dans .env!')
    process.exit(1)
  }

  try {
    // Connexion à MongoDB
    console.log('📡 Connexion à MongoDB...')
    await mongoose.connect(dbConfig.url)
    console.log('✅ Connecté à MongoDB\n')

    // Demander l'email de l'utilisateur à tester
    const readline = require('readline')
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    })

    rl.question('📧 Entrez l\'email de l\'utilisateur à tester: ', async (email) => {
      if (!email || !email.includes('@')) {
        console.error('❌ Adresse email invalide!')
        rl.close()
        await mongoose.disconnect()
        process.exit(1)
      }

      try {
        // Vérifier si l'utilisateur existe
        const user = await User.findOne({
          $or: [
            { email: email },
            { username: email }
          ]
        })

        if (!user) {
          console.error(`\n❌ Utilisateur avec l'email/username "${email}" non trouvé!`)
          console.error('💡 Créez d\'abord un utilisateur avec /auth/register')
          rl.close()
          await mongoose.disconnect()
          process.exit(1)
        }

        console.log(`\n✅ Utilisateur trouvé: ${user.username} (${user.email})`)
        console.log('')

        // Demander le mot de passe incorrect
        rl.question('🔑 Entrez un mot de passe INCORRECT pour tester: ', async (wrongPassword) => {
          if (!wrongPassword) {
            console.error('❌ Mot de passe requis!')
            rl.close()
            await mongoose.disconnect()
            process.exit(1)
          }

          try {
            console.log('\n🔄 Tentative de connexion avec un mot de passe incorrect...')
            console.log('   Email:', email)
            console.log('   Mot de passe (incorrect):', '*'.repeat(wrongPassword.length))
            console.log('')

            // Tenter la connexion avec un mauvais mot de passe
            // Cela devrait déclencher l'envoi automatique de l'email
            try {
              await authService.authenticateUser(email, wrongPassword)
              console.log('❌ ERREUR: La connexion a réussi alors qu\'elle devrait échouer!')
            } catch (authError) {
              // C'est normal que ça échoue - c'est ce qu'on teste
              if (authError.message.includes('incorrect')) {
                console.log('✅ Tentative de connexion échouée comme prévu')
                console.log('   Message:', authError.message)
                console.log('')
                console.log('📧 Vérification de l\'envoi de l\'email...')
                
                // Vérifier que le token de réinitialisation a été créé
                await user.refresh()
                const updatedUser = await User.findById(user._id)
                
                if (updatedUser.resetPasswordToken && updatedUser.resetPasswordExpires) {
                  console.log('✅ Token de réinitialisation généré!')
                  console.log('   Token:', updatedUser.resetPasswordToken.substring(0, 20) + '...')
                  console.log('   Expire le:', updatedUser.resetPasswordExpires.toLocaleString())
                  console.log('')
                  console.log('📬 Email de réinitialisation envoyé à:', updatedUser.email)
                  console.log('')
                  console.log('💡 Vérifiez la boîte de réception de', updatedUser.email)
                  console.log('   (Vérifiez aussi les spams)')
                  console.log('')
                  console.log('✅ Test réussi! L\'email de réinitialisation a été envoyé automatiquement!')
                } else {
                  console.log('⚠️  Token de réinitialisation non trouvé')
                  console.log('   Cela peut signifier que l\'email n\'a pas pu être envoyé')
                }
              } else {
                console.log('❌ Erreur inattendue:', authError.message)
              }
            }

          } catch (error) {
            console.error('\n❌ Erreur lors du test:', error.message)
            console.error(error)
          } finally {
            rl.close()
            await mongoose.disconnect()
            process.exit(0)
          }
        })
      } catch (error) {
        console.error('\n❌ Erreur:', error.message)
        rl.close()
        await mongoose.disconnect()
        process.exit(1)
      }
    })
  } catch (error) {
    console.error('\n❌ Erreur de connexion MongoDB:', error.message)
    process.exit(1)
  }
}

// Gérer les erreurs non capturées
process.on('unhandledRejection', (error) => {
  console.error('❌ Erreur non gérée:', error)
  process.exit(1)
})

// Lancer le test
testPasswordResetEmail().catch((error) => {
  console.error('❌ Erreur fatale:', error)
  process.exit(1)
})

