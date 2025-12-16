require('dotenv').config()
const http = require('http')

const userData = {
  "username": "test_" + Date.now(),
  "email": "maram.kaouech@isgb.ucar.tn",
  "password": "Test1234@",
  "role": "user",
  "cin": String(10000000 + (Date.now() % 90000000))
}

function createUser(userData) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(userData)
    
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/user/add',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    }

    const req = http.request(options, (res) => {
      let data = ''
      res.on('data', (chunk) => { data += chunk })
      res.on('end', () => {
        try {
          const response = JSON.parse(data)
          resolve({ statusCode: res.statusCode, body: response })
        } catch (e) {
          resolve({ statusCode: res.statusCode, body: data })
        }
      })
    })

    req.on('error', reject)
    req.write(postData)
    req.end()
  })
}

async function test() {
  console.log('🧪 Test de création utilisateur + vérification email\n')
  console.log('📋 Configuration Brevo:')
  console.log('   BREVO_API_KEY:', process.env.BREVO_API_KEY ? '✓ Configuré' : '✗ Manquant')
  console.log('   MAIL_FROM:', process.env.MAIL_FROM || '✗ Manquant')
  console.log('')
  console.log('📝 Création utilisateur:')
  console.log(JSON.stringify(userData, null, 2))
  console.log('')

  try {
    const result = await createUser(userData)
    
    if (result.statusCode === 201) {
      console.log('✅ Utilisateur créé avec succès!')
      console.log('')
      console.log('📧 Vérification de l\'envoi d\'email:')
      console.log('   ⚠️  IMPORTANT: Vérifiez les logs du serveur pour voir si l\'email a été envoyé')
      console.log('   📋 Dans la console du serveur, vous devriez voir:')
      console.log('      - "📧 Tentative d\'envoi d\'email de bienvenue à: ..."')
      console.log('      - Soit "✅ Email de bienvenue envoyé avec succès"')
      console.log('      - Soit "❌ Erreur lors de l\'envoi de l\'email"')
      console.log('')
      console.log('💡 Si vous voyez une erreur "Key not found":')
      console.log('   1. Vérifiez votre clé API Brevo dans .env')
      console.log('   2. Connectez-vous à https://app.brevo.com')
      console.log('   3. Allez dans Settings > SMTP & API > API Keys')
      console.log('   4. Vérifiez ou créez une nouvelle clé API')
      console.log('   5. Assurez-vous que l\'email maramkaouech25@gmail.com est vérifié')
      console.log('')
      console.log('📬 Email devrait être envoyé à:', userData.email)
      console.log('   (Vérifiez aussi les spams)')
    } else {
      console.log('❌ Erreur lors de la création:', JSON.stringify(result.body, null, 2))
    }
  } catch (error) {
    console.error('❌ Erreur:', error.message)
  }
}

test()

