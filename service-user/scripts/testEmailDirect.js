require('dotenv').config()
const emailService = require('../services/emailService')

async function testEmail() {
  console.log('🧪 Test d\'envoi d\'email direct\n')
  console.log('📋 Configuration:')
  console.log('   BREVO_API_KEY:', process.env.BREVO_API_KEY ? '✓ Configuré' : '✗ Manquant')
  console.log('   MAIL_FROM:', process.env.MAIL_FROM || '✗ Manquant')
  console.log('   MAIL_FROM_NAME:', process.env.MAIL_FROM_NAME || '✗ Manquant')
  console.log('')

  const testEmailData = {
    to: 'maramkaouech26@gmail.com',
    subject: 'Test Email - Sportify',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #1DB954;">Test Email</h2>
        <p>Ceci est un test d'envoi d'email depuis Sportify.</p>
        <p>Si vous recevez cet email, la configuration fonctionne!</p>
      </div>
    `,
    text: 'Test Email - Ceci est un test d\'envoi d\'email depuis Sportify.'
  }

  console.log('📤 Envoi de l\'email à:', testEmailData.to)
  console.log('   De:', process.env.MAIL_FROM)
  console.log('')

  try {
    const result = await emailService.sendEmail(testEmailData)
    console.log('✅ Email envoyé avec succès!')
    console.log('   Message ID:', result.messageId)
    console.log('')
    console.log('💡 Vérifiez la boîte de réception de:', testEmailData.to)
    console.log('   (Vérifiez aussi les spams)')
  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi de l\'email:')
    console.error('   ', error.message)
    console.error('')
    if (error.message.includes('401') || error.message.includes('Unauthorized')) {
      console.error('💡 Vérifiez que votre clé API Brevo est correcte.')
    } else if (error.message.includes('400')) {
      console.error('💡 Vérifiez que l\'adresse email de l\'expéditeur est vérifiée dans votre compte Brevo.')
    } else if (error.message.includes('403')) {
      console.error('💡 Vérifiez les permissions de votre clé API Brevo.')
    }
  }
}

testEmail()

