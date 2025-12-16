require('dotenv').config()
const emailService = require('../services/emailService')

async function testBrevoConfiguration() {
  console.log('🧪 Test de la configuration Brevo\n')
  console.log('📋 Configuration actuelle:')
  console.log('   BREVO_API_KEY:', process.env.BREVO_API_KEY ? `✓ Configuré (${process.env.BREVO_API_KEY.substring(0, 20)}...)` : '✗ MANQUANT')
  console.log('   MAIL_FROM:', process.env.MAIL_FROM || '✗ Manquant')
  console.log('   MAIL_FROM_NAME:', process.env.MAIL_FROM_NAME || '✗ Manquant')
  console.log('')

  if (!process.env.BREVO_API_KEY) {
    console.error('❌ ERREUR: BREVO_API_KEY manquante dans .env!')
    process.exit(1)
  }

  if (!process.env.MAIL_FROM) {
    console.error('❌ ERREUR: MAIL_FROM manquant dans .env!')
    process.exit(1)
  }

  // Demander l'email de test
  const readline = require('readline')
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })

  rl.question('📧 Entrez l\'adresse email de destination pour le test: ', async (testEmail) => {
    if (!testEmail || !testEmail.includes('@')) {
      console.error('❌ Adresse email invalide!')
      rl.close()
      process.exit(1)
    }

    try {
      console.log(`\n📤 Envoi de l'email de test à ${testEmail}...`)
      console.log('')

      const emailContent = {
        to: testEmail,
        subject: '🎉 Test Email - Configuration Brevo',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
            <div style="background-color: #1DB954; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; font-size: 28px;">✅ Test Email Réussi!</h1>
            </div>
            <div style="background-color: white; padding: 30px; border-radius: 0 0 8px 8px;">
              <p style="font-size: 16px; color: #333; line-height: 1.6;">
                Bonjour,
              </p>
              <p style="font-size: 16px; color: #333; line-height: 1.6;">
                Ceci est un email de test depuis <strong>Sportify</strong>!
              </p>
              <p style="font-size: 16px; color: #333; line-height: 1.6;">
                Si vous recevez cet email, cela signifie que la configuration Brevo fonctionne correctement! ✅
              </p>
              <div style="background-color: #d4edda; padding: 15px; border-left: 4px solid #28a745; margin: 20px 0;">
                <p style="margin: 0; font-size: 14px; color: #155724;">
                  <strong>✅ Configuration validée:</strong><br>
                  API Key: ${process.env.BREVO_API_KEY ? 'Configurée' : 'Manquante'}<br>
                  Expéditeur: ${process.env.MAIL_FROM}<br>
                  Nom: ${process.env.MAIL_FROM_NAME || 'Sportify'}
                </p>
              </div>
              <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
              <p style="font-size: 12px; color: #999; text-align: center; margin: 0;">
                Envoyé depuis Sportify - Test de configuration Brevo
              </p>
            </div>
          </div>
        `,
        text: `Test Email Réussi!

Ceci est un email de test depuis Sportify. Si vous recevez cet email, cela signifie que la configuration Brevo fonctionne correctement!

Configuration validée:
- API Key: ${process.env.BREVO_API_KEY ? 'Configurée' : 'Manquante'}
- Expéditeur: ${process.env.MAIL_FROM}
- Nom: ${process.env.MAIL_FROM_NAME || 'Sportify'}

Envoyé depuis Sportify - Test de configuration Brevo`
      }

      const result = await emailService.sendEmail(emailContent)

      console.log('✅ Email envoyé avec succès!')
      console.log('   Message ID:', result.messageId)
      console.log('   Destinataire:', testEmail)
      console.log('   Expéditeur:', process.env.MAIL_FROM)
      console.log('')
      console.log('💡 Vérifiez votre boîte de réception (et les spams) pour confirmer la réception.')
      console.log('   L\'email devrait arriver dans quelques secondes!')
      console.log('')
      console.log('✅ Configuration Brevo validée avec succès!')

    } catch (error) {
      console.error('\n❌ ERREUR lors de l\'envoi de l\'email:')
      console.error('   Message:', error.message)
      console.error('')
      
      if (error.message.includes('401') || error.message.includes('Unauthorized') || error.message.includes('Invalid')) {
        console.error('💡 SOLUTION: Vérifiez que:')
        console.error('   1. Votre clé API Brevo est correcte dans .env')
        console.error('   2. La clé API commence par "xkeysib-"')
        console.error('   3. Vous avez copié toute la clé API')
        console.error('   4. L\'email expéditeur (marouuum26@gmail.com) est vérifié dans votre compte Brevo')
        console.error('')
        console.error('   URL pour vérifier: https://app.brevo.com/settings/senders')
      } else if (error.message.includes('400')) {
        console.error('💡 SOLUTION: Vérifiez que:')
        console.error('   1. L\'adresse email de l\'expéditeur est vérifiée dans votre compte Brevo')
        console.error('   2. L\'email expéditeur est valide')
        console.error('')
        console.error('   URL pour vérifier: https://app.brevo.com/settings/senders')
      }
      
      process.exit(1)
    } finally {
      rl.close()
      process.exit(0)
    }
  })
}

// Lancer le test
testBrevoConfiguration().catch((error) => {
  console.error('❌ Erreur fatale:', error)
  process.exit(1)
})

