/**
 * Script de test pour l'authentification
 * Permet de tester la génération et la vérification des tokens JWT
 */

require('dotenv').config()
const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
const User = require('../model/user')
const dbConfig = require('../config/dbconnection.json')

// Configuration
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key-change-in-production'

async function testAuth() {
  try {
    // Connexion à MongoDB
    await mongoose.connect(dbConfig.url)
    console.log('✅ Connexion à MongoDB réussie\n')

    // Créer un utilisateur de test
    console.log('📝 Création d\'un utilisateur de test...')
    const testUser = await User.findOne({ email: 'test@example.com' })
    
    if (!testUser) {
      console.log('❌ Utilisateur test non trouvé. Créez d\'abord un utilisateur via /auth/register')
      process.exit(1)
    }

    console.log('✅ Utilisateur trouvé:', testUser.email)
    console.log('   ID:', testUser._id.toString())
    console.log('   Username:', testUser.username)
    console.log('   Role:', testUser.role)
    console.log('')

    // Générer un access token
    console.log('🔑 Génération d\'un access token...')
    const accessTokenPayload = {
      userId: testUser._id.toString(),
      username: testUser.username,
      email: testUser.email,
      role: testUser.role
    }

    const accessToken = jwt.sign(accessTokenPayload, JWT_SECRET, {
      expiresIn: '15m',
      issuer: 'sportify-api',
      audience: 'sportify-client'
    })

    console.log('✅ Access token généré:')
    console.log('   Token:', accessToken.substring(0, 50) + '...')
    console.log('')

    // Décoder le token pour voir son contenu
    console.log('📖 Décodage du token (sans vérification)...')
    const decoded = jwt.decode(accessToken)
    console.log('   Payload:', JSON.stringify(decoded, null, 2))
    console.log('')

    // Vérifier le token
    console.log('✅ Vérification du token...')
    try {
      const verified = jwt.verify(accessToken, JWT_SECRET, {
        issuer: 'sportify-api',
        audience: 'sportify-client'
      })
      console.log('   ✅ Token valide!')
      console.log('   UserId:', verified.userId)
      console.log('   Username:', verified.username)
      console.log('   Role:', verified.role)
      console.log('   Expires at:', new Date(verified.exp * 1000).toISOString())
      console.log('')

      // Test avec un token expiré (optionnel)
      console.log('⚠️  Test avec un token expiré...')
      const expiredToken = jwt.sign(accessTokenPayload, JWT_SECRET, {
        expiresIn: '-1h', // Expiré il y a 1 heure
        issuer: 'sportify-api',
        audience: 'sportify-client'
      })

      try {
        jwt.verify(expiredToken, JWT_SECRET, {
          issuer: 'sportify-api',
          audience: 'sportify-client'
        })
        console.log('   ❌ Le token expiré devrait être rejeté!')
      } catch (expiredErr) {
        console.log('   ✅ Token expiré correctement rejeté')
        console.log('   Erreur:', expiredErr.name, '-', expiredErr.message)
      }
      console.log('')

      // Test avec un mauvais secret
      console.log('⚠️  Test avec un mauvais secret...')
      try {
        jwt.verify(accessToken, 'wrong-secret', {
          issuer: 'sportify-api',
          audience: 'sportify-client'
        })
        console.log('   ❌ Le token avec mauvais secret devrait être rejeté!')
      } catch (secretErr) {
        console.log('   ✅ Token avec mauvais secret correctement rejeté')
        console.log('   Erreur:', secretErr.name, '-', secretErr.message)
      }
      console.log('')

      // Instructions pour utiliser le token
      console.log('📋 Instructions pour utiliser le token:')
      console.log('   1. Copiez le token ci-dessus')
      console.log('   2. Utilisez-le dans vos requêtes:')
      console.log('      curl -H "Authorization: Bearer ' + accessToken.substring(0, 50) + '..." http://localhost:3000/user/showall')
      console.log('   3. Ou dans le header de vos requêtes HTTP:')
      console.log('      Authorization: Bearer ' + accessToken.substring(0, 50) + '...')
      console.log('')

    } catch (verifyErr) {
      console.log('   ❌ Erreur de vérification:', verifyErr.name)
      console.log('   Message:', verifyErr.message)
      console.log('')
    }

    // Afficher les secrets utilisés (masqués)
    console.log('🔐 Configuration des secrets:')
    console.log('   JWT_SECRET:', JWT_SECRET.substring(0, 10) + '...' + (JWT_SECRET.length > 10 ? ' (configuré)' : ' (par défaut - CHANGEZ EN PRODUCTION!)'))
    console.log('   JWT_REFRESH_SECRET:', JWT_REFRESH_SECRET.substring(0, 10) + '...' + (JWT_REFRESH_SECRET.length > 10 ? ' (configuré)' : ' (par défaut - CHANGEZ EN PRODUCTION!)'))
    console.log('')

    if (JWT_SECRET === 'your-secret-key-change-in-production' || 
        JWT_REFRESH_SECRET === 'your-refresh-secret-key-change-in-production') {
      console.log('⚠️  ATTENTION: Vous utilisez les secrets par défaut!')
      console.log('   Créez un fichier .env avec:')
      console.log('   JWT_SECRET=votre-secret-super-securise-min-32-caracteres')
      console.log('   JWT_REFRESH_SECRET=votre-refresh-secret-super-securise-min-32-caracteres')
      console.log('')
    }

    process.exit(0)
  } catch (err) {
    console.error('❌ Erreur:', err.message)
    console.error(err.stack)
    process.exit(1)
  }
}

testAuth()

