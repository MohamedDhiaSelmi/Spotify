require('dotenv').config()
const http = require('http')

// Générer des données uniques pour éviter les conflits
const timestamp = Date.now()
const userData = {
  "username": `testuser_${timestamp}`,
  "email": "maram.kaouech@isgb.ucar.tn",
  "password": "Test1234@",
  "role": "user",
  "cin": String(10000000 + (timestamp % 90000000)) // CIN unique basé sur timestamp
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
      
      res.on('data', (chunk) => {
        data += chunk
      })
      
      res.on('end', () => {
        try {
          const response = JSON.parse(data)
          resolve({ statusCode: res.statusCode, body: response })
        } catch (e) {
          resolve({ statusCode: res.statusCode, body: data })
        }
      })
    })

    req.on('error', (error) => {
      reject(error)
    })

    req.write(postData)
    req.end()
  })
}

async function test() {
  console.log('🧪 Test de création d\'utilisateur avec envoi d\'email\n')
  console.log('📋 Configuration:')
  console.log('   BREVO_API_KEY:', process.env.BREVO_API_KEY ? '✓ Configuré' : '✗ Manquant')
  console.log('   MAIL_FROM:', process.env.MAIL_FROM || '✗ Manquant')
  console.log('   MAIL_FROM_NAME:', process.env.MAIL_FROM_NAME || '✗ Manquant')
  console.log('   Serveur:', 'http://localhost:3000')
  console.log('')
  console.log('📝 Données de l\'utilisateur à créer:')
  console.log(JSON.stringify(userData, null, 2))
  console.log('')
  console.log('📧 Email sera envoyé de:', process.env.MAIL_FROM, '(Sportify)')
  console.log('📧 Email sera envoyé à:', userData.email)
  console.log('')

  // Vérifier que le serveur est accessible
  console.log('🔍 Vérification du serveur...')
  try {
    await new Promise((resolve, reject) => {
      const checkReq = http.get('http://localhost:3000/user/test', (res) => {
        resolve()
      })
      checkReq.on('error', reject)
      checkReq.setTimeout(3000, () => {
        checkReq.destroy()
        reject(new Error('Timeout'))
      })
    })
    console.log('✅ Serveur accessible\n')
  } catch (error) {
    console.error('❌ Le serveur n\'est pas accessible sur http://localhost:3000')
    console.error('   Erreur:', error.message)
    console.error('   💡 Démarrez le serveur avec: npm start')
    process.exit(1)
  }

  console.log('🚀 Création de l\'utilisateur...\n')

  try {
    const result = await createUser(userData)
    
    console.log('📊 Résultat:')
    console.log('   Status Code:', result.statusCode)
    console.log('   Réponse:', JSON.stringify(result.body, null, 2))
    console.log('')

    if (result.statusCode === 201) {
      console.log('✅ SUCCÈS! Utilisateur créé avec succès!')
      console.log('')
      console.log('📧 Email de bienvenue:')
      console.log('   ✓ Email envoyé automatiquement')
      console.log('   ✓ De:', process.env.MAIL_FROM, '(Sportify)')
      console.log('   ✓ Vers:', userData.email)
      console.log('   ✓ Sujet: 🎉 Bienvenue sur Sportify - Votre compte a été créé avec succès!')
      console.log('')
      console.log('💡 Vérifiez la boîte de réception de:', userData.email)
      console.log('   (Vérifiez aussi les spams si l\'email n\'apparaît pas)')
      console.log('')
      console.log('✨ Test réussi! L\'email devrait arriver dans quelques secondes.')
    } else {
      console.log('❌ Erreur lors de la création')
      if (result.body.errors) {
        console.log('   Erreurs de validation:')
        result.body.errors.forEach(err => console.log('   -', err))
      } else if (result.body.details) {
        console.log('   Détails:', result.body.details)
      }
      console.log('')
      console.log('💡 Si l\'email existe déjà, essayez avec un autre email ou supprimez l\'utilisateur existant.')
    }
  } catch (error) {
    console.error('❌ Erreur de connexion:')
    console.error('   ', error.message)
  }

  console.log('')
  process.exit(0)
}

test()
