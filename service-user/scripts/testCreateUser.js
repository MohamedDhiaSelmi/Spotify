require('dotenv').config()
const http = require('http')

const testUsers = [
  {
    username: 'testuser_' + Date.now(),
    email: 'testuser@example.com', // Remplacez par votre email pour recevoir le test
    password: 'Test1234@',
    role: 'user',
    cin: String(Math.floor(10000000 + Math.random() * 90000000)) // 8 chiffres aléatoires
  },
  {
    username: 'testadmin_' + Date.now(),
    email: 'testadmin@example.com', // Remplacez par votre email pour recevoir le test
    password: 'Admin1234@',
    role: 'admin',
    cin: String(Math.floor(10000000 + Math.random() * 90000000))
  },
  {
    username: 'testcoach_' + Date.now(),
    email: 'testcoach@example.com', // Remplacez par votre email pour recevoir le test
    password: 'Coach1234@',
    role: 'coach',
    cin: String(Math.floor(10000000 + Math.random() * 90000000)),
    specialite: 'Fitness'
  }
]

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

async function runTests() {
  console.log('🧪 Test de création d\'utilisateurs avec envoi d\'email automatique\n')
  console.log('📋 Configuration:')
  console.log('   BREVO_API_KEY:', process.env.BREVO_API_KEY ? '✓ Configuré' : '✗ Manquant')
  console.log('   MAIL_FROM:', process.env.MAIL_FROM || '✗ Manquant')
  console.log('   MAIL_FROM_NAME:', process.env.MAIL_FROM_NAME || '✗ Manquant')
  console.log('   Serveur:', 'http://localhost:3000')
  console.log('')

  // Demander l'email de test
  const readline = require('readline')
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })

  rl.question('📧 Entrez votre adresse email pour recevoir les emails de test (ou appuyez sur Entrée pour utiliser les emails par défaut): ', async (testEmail) => {
    // Mettre à jour les emails si fourni
    if (testEmail && testEmail.includes('@')) {
      testUsers.forEach(user => {
        user.email = testEmail
      })
    }

    console.log('\n🚀 Démarrage des tests...\n')

    for (let i = 0; i < testUsers.length; i++) {
      const user = testUsers[i]
      console.log(`\n${'='.repeat(60)}`)
      console.log(`Test ${i + 1}/3: Création d'un ${user.role.toUpperCase()}`)
      console.log(`${'='.repeat(60)}`)
      console.log(`Username: ${user.username}`)
      console.log(`Email: ${user.email}`)
      console.log(`Role: ${user.role}`)
      if (user.specialite) {
        console.log(`Spécialité: ${user.specialite}`)
      }
      console.log('')

      try {
        const result = await createUser(user)
        
        if (result.statusCode === 201) {
          console.log('✅ Utilisateur créé avec succès!')
          console.log('   Status:', result.statusCode)
          console.log('   Message:', result.body.message)
          console.log('   📧 Email de bienvenue envoyé automatiquement à:', user.email)
          console.log('   💡 Vérifiez votre boîte de réception (et les spams)')
        } else {
          console.log('❌ Erreur lors de la création:')
          console.log('   Status:', result.statusCode)
          console.log('   Réponse:', JSON.stringify(result.body, null, 2))
        }
      } catch (error) {
        console.log('❌ Erreur de connexion:')
        console.log('   ', error.message)
        console.log('   💡 Assurez-vous que le serveur est démarré (npm start)')
      }

      // Attendre 2 secondes entre chaque test
      if (i < testUsers.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000))
      }
    }

    console.log('\n' + '='.repeat(60))
    console.log('✨ Tests terminés!')
    console.log('='.repeat(60))
    console.log('\n💡 Résumé:')
    console.log('   - 3 utilisateurs testés (user, admin, coach)')
    console.log('   - Emails envoyés à:', testEmail || 'emails par défaut')
    console.log('   - Vérifiez votre boîte de réception pour les emails de bienvenue')
    console.log('')

    rl.close()
    process.exit(0)
  })
}

// Vérifier que le serveur est accessible
const checkServer = http.get('http://localhost:3000/user/test', (res) => {
  runTests()
}).on('error', (err) => {
  console.error('❌ Le serveur n\'est pas accessible sur http://localhost:3000')
  console.error('   Erreur:', err.message)
  console.error('   💡 Démarrez le serveur avec: npm start')
  process.exit(1)
})
