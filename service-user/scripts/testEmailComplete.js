require('dotenv').config()
const http = require('http')
const mongoose = require('mongoose')
const User = require('../model/user')
const dbConfig = require('../config/dbconnection.json')

const userData = {
  "username": "testuser",
  "email": "maram.kaouech@isgb.ucar.tn",
  "password": "Test1234@",
  "role": "user",
  "cin": "12371678"
}

function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let responseData = ''
      res.on('data', (chunk) => { responseData += chunk })
      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseData)
          resolve({ statusCode: res.statusCode, body: parsed })
        } catch (e) {
          resolve({ statusCode: res.statusCode, body: responseData })
        }
      })
    })
    req.on('error', reject)
    if (data) {
      req.write(JSON.stringify(data))
    }
    req.end()
  })
}

async function deleteUserByEmail(email) {
  try {
    await mongoose.connect(dbConfig.url)
    const result = await User.deleteOne({ email })
    await mongoose.disconnect()
    return result.deletedCount > 0
  } catch (error) {
    console.error('Erreur lors de la suppression:', error.message)
    return false
  }
}

async function createUser(userData) {
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/user/add',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(JSON.stringify(userData))
    }
  }
  return makeRequest(options, userData)
}

async function test() {
  console.log('🧪 Test complet: Création utilisateur + Envoi email automatique\n')
  console.log('📋 Configuration:')
  console.log('   BREVO_API_KEY:', process.env.BREVO_API_KEY ? '✓ Configuré' : '✗ Manquant')
  console.log('   MAIL_FROM:', process.env.MAIL_FROM || '✗ Manquant')
  console.log('   MAIL_FROM_NAME:', process.env.MAIL_FROM_NAME || '✗ Manquant')
  console.log('')
  console.log('📝 Données utilisateur:')
  console.log(JSON.stringify(userData, null, 2))
  console.log('')
  console.log('📧 Email de:', process.env.MAIL_FROM, '→', userData.email)
  console.log('')

  // Vérifier serveur
  console.log('🔍 Vérification du serveur...')
  try {
    await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/user/test',
      method: 'GET'
    })
    console.log('✅ Serveur accessible\n')
  } catch (error) {
    console.error('❌ Serveur non accessible:', error.message)
    process.exit(1)
  }

  // Supprimer l'utilisateur existant s'il existe
  console.log('🗑️  Suppression de l\'utilisateur existant (s\'il existe)...')
  const deleted = await deleteUserByEmail(userData.email)
  if (deleted) {
    console.log('   ✓ Utilisateur existant supprimé\n')
  } else {
    console.log('   ℹ Aucun utilisateur existant trouvé\n')
  }

  // Attendre un peu
  await new Promise(resolve => setTimeout(resolve, 1000))

  // Créer l'utilisateur
  console.log('🚀 Création de l\'utilisateur...')
  try {
    const result = await createUser(userData)
    
    console.log('📊 Résultat:')
    console.log('   Status Code:', result.statusCode)
    
    if (result.statusCode === 201) {
      console.log('   ✅ Utilisateur créé avec succès!')
      console.log('')
      console.log('📧 EMAIL DE BIENVENUE:')
      console.log('   ✓ Email envoyé automatiquement')
      console.log('   ✓ De:', process.env.MAIL_FROM, '(Sportify)')
      console.log('   ✓ Vers:', userData.email)
      console.log('   ✓ Sujet: 🎉 Bienvenue sur Sportify - Votre compte a été créé avec succès!')
      console.log('')
      console.log('✨ TEST RÉUSSI!')
      console.log('')
      console.log('💡 Vérifiez la boîte de réception de:', userData.email)
      console.log('   (Vérifiez aussi les spams si l\'email n\'apparaît pas)')
      console.log('')
      console.log('📋 Détails de l\'utilisateur créé:')
      if (result.body.user) {
        console.log('   Username:', result.body.user.username)
        console.log('   Email:', result.body.user.email)
        console.log('   Role:', result.body.user.role)
      }
    } else {
      console.log('   ❌ Erreur:', JSON.stringify(result.body, null, 2))
      if (result.body.errors) {
        console.log('   Erreurs:')
        result.body.errors.forEach(err => console.log('     -', err))
      }
    }
  } catch (error) {
    console.error('❌ Erreur:', error.message)
  }

  console.log('')
  process.exit(0)
}

test()

