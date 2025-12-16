require('dotenv').config()
const emailService = require('../services/emailService')

async function testEmail() {
  console.log('🧪 Test d\'envoi d\'email via Brevo...\n')
  
  // Vérification des variables d'environnement
  console.log('📋 Vérification de la configuration:')
  console.log('   BREVO_API_KEY:', process.env.BREVO_API_KEY ? '✓ Configuré' : '✗ Manquant')
  console.log('   MAIL_FROM:', process.env.MAIL_FROM || '✗ Manquant')
  console.log('   MAIL_FROM_NAME:', process.env.MAIL_FROM_NAME || '✗ Manquant')
  console.log('')

  // Demander l'email de destination
  const readline = require('readline')
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })

  rl.question('📧 Entrez l\'adresse email de destination pour le test: ', async (toEmail) => {
    if (!toEmail || !toEmail.includes('@')) {
      console.log('❌ Adresse email invalide')
      rl.close()
      process.exit(1)
    }

    try {
      console.log(`\n📤 Envoi de l'email à ${toEmail}...`)
      
      const result = await emailService.sendEmail({
        to: toEmail,
        subject: 'Test Email - Sportify',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #1DB954;">🎉 Test Email Réussi!</h2>
            <p>Bonjour,</p>
            <p>Ceci est un email de test depuis <strong>Sportify</strong>.</p>
            <p>Si vous recevez cet email, cela signifie que la configuration Brevo fonctionne correctement! ✅</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
            <p style="color: #666; font-size: 12px;">
              Envoyé depuis: ${process.env.MAIL_FROM}<br>
              Nom de l'expéditeur: ${process.env.MAIL_FROM_NAME}
            </p>
          </div>
        `,
        text: 'Test Email Réussi! Ceci est un email de test depuis Sportify. Si vous recevez cet email, cela signifie que la configuration Brevo fonctionne correctement!'
      })

      console.log('\n✅ Email envoyé avec succès!')
      console.log('   Message ID:', result.messageId)
      console.log('\n💡 Vérifiez votre boîte de réception (et les spams) pour confirmer la réception.')
      
    } catch (error) {
      console.error('\n❌ Erreur lors de l\'envoi de l\'email:')
      console.error('   ', error.message)
      
      if (error.message.includes('401') || error.message.includes('Unauthorized')) {
        console.error('\n💡 Vérifiez que votre clé API Brevo est correcte.')
      } else if (error.message.includes('400')) {
        console.error('\n💡 Vérifiez que l\'adresse email de l\'expéditeur est vérifiée dans votre compte Brevo.')
      }
    } finally {
      rl.close()
      process.exit(0)
    }
  })
}

// Lancer le test
testEmail().catch(error => {
  console.error('❌ Erreur fatale:', error.message)
  process.exit(1)
})

