require('dotenv').config()
const emailService = require('../services/emailService')

// Récupérer l'email depuis les arguments de ligne de commande
const toEmail = process.argv[2]

if (!toEmail || !toEmail.includes('@')) {
  console.log('❌ Usage: node scripts/mailTestSimple.js <email@example.com>')
  console.log('   Exemple: node scripts/mailTestSimple.js test@example.com')
  process.exit(1)
}

async function testEmail() {
  console.log('🧪 Test d\'envoi d\'email via Brevo...\n')
  
  // Vérification des variables d'environnement
  console.log('📋 Configuration:')
  console.log('   BREVO_API_KEY:', process.env.BREVO_API_KEY ? '✓ Configuré' : '✗ Manquant')
  console.log('   MAIL_FROM:', process.env.MAIL_FROM || 'noreply@sportify.com (par défaut)')
  console.log('   MAIL_FROM_NAME:', process.env.MAIL_FROM_NAME || 'Sportify (par défaut)')
  console.log('')

  try {
    console.log(`📤 Envoi de l'email à ${toEmail}...`)
    
    const result = await emailService.sendEmail({
      to: toEmail,
      subject: 'Test Email - Sportify',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
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
    
    if (error.message.includes('401') || error.message.includes('Unauthorized') || error.message.includes('Invalid')) {
      console.error('\n💡 Vérifiez que:')
      console.error('   1. BREVO_API_KEY est correct dans .env')
      console.error('   2. La clé API commence par "xkeysib-"')
      console.error('   3. Vous avez copié toute la clé API')
      console.error('   4. Consultez GUIDE_BREVO.md pour obtenir votre clé API')
      console.error('   URL directe: https://app.brevo.com/settings/keys/api')
    }
    
    process.exit(1)
  }
}

// Lancer le test
testEmail()
