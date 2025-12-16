require('dotenv').config()
const emailService = require('../services/emailService')

async function testEmail() {
  console.log('🧪 Test d\'envoi d\'email via Brevo\n')
  console.log('📋 Configuration actuelle:')
  console.log('   BREVO_API_KEY:', process.env.BREVO_API_KEY ? `✓ Configuré (${process.env.BREVO_API_KEY.substring(0, 20)}...)` : '✗ MANQUANT')
  console.log('   MAIL_FROM:', process.env.MAIL_FROM || 'noreply@sportify.com (par défaut)')
  console.log('   MAIL_FROM_NAME:', process.env.MAIL_FROM_NAME || 'Sportify (par défaut)')
  console.log('')

  if (!process.env.BREVO_API_KEY) {
    console.error('❌ ERREUR: Configuration Brevo manquante dans .env!')
    console.error('')
    console.error('💡 Pour corriger:')
    console.error('   1. Allez sur: https://www.brevo.com/')
    console.error('   2. Créez un compte gratuit')
    console.error('   3. Allez dans votre profil > "SMTP & API" > "API Keys"')
    console.error('   4. Cliquez sur "Generate a new API key"')
    console.error('   5. Donnez un nom (ex: Sportify) et copiez la clé')
    console.error('   6. Ajoutez dans .env:')
    console.error('      BREVO_API_KEY=xkeysib-votre_cle_ici')
    console.error('')
    console.error('   URL directe: https://app.brevo.com/settings/keys/api')
    console.error('   Consultez GUIDE_BREVO.md pour les détails')
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
        subject: '🎉 Test Email - Sportify',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
            <div style="background-color: #1DB954; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; font-size: 28px;">🎉 Test Email Réussi!</h1>
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
              <div style="background-color: #f0f8ff; padding: 15px; border-left: 4px solid #1DB954; margin: 20px 0;">
                <p style="margin: 0; font-size: 14px; color: #555;">
                  <strong>Note:</strong> Cet email a été envoyé via Brevo (Sendinblue).
                </p>
              </div>
              <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
              <p style="font-size: 12px; color: #999; text-align: center; margin: 0;">
                Envoyé depuis Sportify
              </p>
            </div>
          </div>
        `,
        text: 'Test Email Réussi! Ceci est un email de test depuis Sportify. Si vous recevez cet email, cela signifie que la configuration Brevo fonctionne correctement!'
      }

      const result = await emailService.sendEmail(emailContent)

      console.log('✅ Email envoyé avec succès!')
      console.log('   Message ID:', result.messageId)
      console.log('   Destinataire:', testEmail)
      console.log('')
      console.log('💡 Vérifiez votre boîte de réception (et les spams) pour confirmer la réception.')
      console.log('   L\'email devrait arriver dans quelques secondes!')

    } catch (error) {
      console.error('\n❌ ERREUR lors de l\'envoi de l\'email:')
      console.error('   Message:', error.message)
      console.error('')
      
      if (error.message.includes('Configuration Brevo manquante')) {
        console.error('💡 SOLUTION: Configurez BREVO_API_KEY dans .env')
        console.error('   Consultez GUIDE_BREVO.md pour les détails')
      } else if (error.message.includes('401') || error.message.includes('Unauthorized') || error.message.includes('Invalid')) {
        console.error('💡 SOLUTION: Vérifiez que votre clé API Brevo est correcte')
        console.error('   1. Allez sur https://app.brevo.com/settings/keys/api')
        console.error('   2. Vérifiez ou créez une nouvelle clé API')
        console.error('   3. Assurez-vous que la clé commence par "xkeysib-"')
        console.error('   4. Vérifiez que vous avez copié toute la clé API')
      } else if (error.message.includes('403') || error.message.includes('Forbidden')) {
        console.error('💡 SOLUTION: Vérifiez les permissions de votre clé API')
        console.error('   La clé API doit avoir la permission "Send emails"')
      } else if (error.message.includes('429') || error.message.includes('Rate limit')) {
        console.error('💡 SOLUTION: Limite d\'emails atteinte')
        console.error('   Plan gratuit: 300 emails/jour maximum')
        console.error('   Attendez quelques heures ou upgradez votre compte Brevo')
      } else {
        console.error('💡 Vérifiez:')
        console.error('   1. Que BREVO_API_KEY est correct dans .env')
        console.error('   2. Que la clé API est valide et active')
        console.error('   3. Que votre compte Brevo est actif')
        console.error('   4. Consultez GUIDE_BREVO.md pour plus d\'aide')
      }
    }

    rl.close()
    process.exit(0)
  })
}

testEmail()


