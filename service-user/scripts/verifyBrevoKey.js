require('dotenv').config()
const SibApiV3Sdk = require('@getbrevo/brevo')

const apiKey = process.env.BREVO_API_KEY?.trim()

console.log('🔍 Vérification de la clé API Brevo\n')
console.log('Clé API:', apiKey ? `${apiKey.substring(0, 20)}...` : 'MANQUANTE')
console.log('Longueur:', apiKey?.length || 0)
console.log('')

if (!apiKey) {
  console.error('❌ BREVO_API_KEY manquante dans .env')
  process.exit(1)
}

// Tester la configuration
try {
  const defaultClient = SibApiV3Sdk.ApiClient.instance
  const apiKeyAuth = defaultClient.authentications['api-key']
  apiKeyAuth.apiKey = apiKey
  
  const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi()
  
  console.log('✅ Configuration de l\'API créée')
  console.log('')
  console.log('💡 Si vous obtenez toujours "Key not found", cela signifie que:')
  console.log('   1. La clé API est incorrecte ou expirée')
  console.log('   2. La clé API n\'a pas les bonnes permissions')
  console.log('   3. Vous devez générer une nouvelle clé API depuis votre compte Brevo')
  console.log('')
  console.log('📝 Pour obtenir une nouvelle clé API:')
  console.log('   1. Connectez-vous à https://app.brevo.com')
  console.log('   2. Allez dans Settings > SMTP & API > API Keys')
  console.log('   3. Créez une nouvelle clé API')
  console.log('   4. Mettez à jour BREVO_API_KEY dans le fichier .env')
  
} catch (error) {
  console.error('❌ Erreur:', error.message)
}

