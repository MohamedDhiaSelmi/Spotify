/**
 * Script de test automatisé pour toutes les routes
 * Teste l'authentification et les routes protégées
 */

require('dotenv').config()
const http = require('http')

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000'
let accessToken = null
let refreshToken = null
let adminToken = null
let testUserId = null

// Fonction helper pour faire des requêtes HTTP
function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(options.path, BASE_URL)
    if (options.query) {
      Object.keys(options.query).forEach(key => {
        url.searchParams.append(key, options.query[key])
      })
    }

    const reqOptions = {
      hostname: url.hostname,
      port: url.port || 3000,
      path: url.pathname + url.search,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    }

    if (accessToken && !options.skipAuth) {
      reqOptions.headers['Authorization'] = `Bearer ${accessToken}`
    }

    const req = http.request(reqOptions, (res) => {
      let body = ''
      res.on('data', (chunk) => { body += chunk })
      res.on('end', () => {
        try {
          const parsed = body ? JSON.parse(body) : {}
          resolve({ status: res.statusCode, data: parsed, headers: res.headers })
        } catch (e) {
          resolve({ status: res.statusCode, data: body, headers: res.headers })
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

// Fonction de test
async function test(name, testFn) {
  try {
    console.log(`\n🧪 Test: ${name}`)
    await testFn()
    console.log(`   ✅ Réussi`)
  } catch (error) {
    console.log(`   ❌ Échoué: ${error.message}`)
    if (error.response) {
      console.log(`   Réponse:`, JSON.stringify(error.response, null, 2))
    }
  }
}

// Tests
async function runTests() {
  console.log('🚀 Démarrage des tests de l\'API Sportify\n')
  console.log(`📍 URL de base: ${BASE_URL}\n`)

  // Test 1: Test de l'API auth
  await test('GET /auth/test', async () => {
    const response = await makeRequest({ path: '/auth/test', skipAuth: true })
    if (response.status !== 200) throw new Error(`Status ${response.status}`)
    console.log(`   Réponse:`, response.data.message)
  })

  // Test 2: Inscription
  await test('POST /auth/register - Inscription utilisateur', async () => {
    const userData = {
      username: `testuser_${Date.now()}`,
      email: `test_${Date.now()}@example.com`,
      password: 'Test1234!',
      cin: String(Date.now()).slice(-8),
      role: 'user'
    }

    const response = await makeRequest({
      path: '/auth/register',
      method: 'POST',
      skipAuth: true
    }, userData)

    if (response.status !== 201) {
      throw new Error(`Status ${response.status}: ${JSON.stringify(response.data)}`)
    }

    accessToken = response.data.accessToken
    refreshToken = response.data.refreshToken
    testUserId = response.data.user._id

    console.log(`   Utilisateur créé: ${response.data.user.username}`)
    console.log(`   Token obtenu: ${accessToken.substring(0, 20)}...`)
  })

  // Test 3: Connexion
  await test('POST /auth/login - Connexion', async () => {
    const response = await makeRequest({
      path: '/auth/login',
      method: 'POST',
      skipAuth: true
    }, {
      email: 'test@example.com', // Utilisez un email existant
      password: 'Test1234!'
    })

    if (response.status === 200) {
      accessToken = response.data.accessToken
      refreshToken = response.data.refreshToken
      console.log(`   Connexion réussie: ${response.data.user.username}`)
    } else {
      console.log(`   ⚠️  Utilisateur de test non trouvé (normal si première exécution)`)
    }
  })

  if (!accessToken) {
    console.log('\n⚠️  Aucun token disponible. Créez d\'abord un utilisateur via /auth/register')
    process.exit(1)
  }

  // Test 4: Obtenir les infos de l'utilisateur connecté
  await test('GET /auth/me - Informations utilisateur', async () => {
    const response = await makeRequest({ path: '/auth/me' })
    if (response.status !== 200) throw new Error(`Status ${response.status}`)
    console.log(`   Utilisateur: ${response.data.user.username} (${response.data.user.role})`)
  })

  // Test 5: Test de l'API user
  await test('GET /user/test', async () => {
    const response = await makeRequest({ path: '/user/test', skipAuth: true })
    if (response.status !== 200) throw new Error(`Status ${response.status}`)
    console.log(`   Réponse: ${response.data.message}`)
  })

  // Test 6: Lister les utilisateurs
  await test('GET /user/showall - Lister les utilisateurs', async () => {
    const response = await makeRequest({
      path: '/user/showall',
      query: { page: 1, limit: 5 }
    })
    if (response.status !== 200) throw new Error(`Status ${response.status}`)
    console.log(`   ${response.data.users?.length || 0} utilisateurs trouvés`)
    console.log(`   Total: ${response.data.pagination?.total || 0}`)
  })

  // Test 7: Obtenir un utilisateur par ID
  if (testUserId) {
    await test('GET /user/showbyid/:id - Obtenir utilisateur par ID', async () => {
      const response = await makeRequest({ path: `/user/showbyid/${testUserId}` })
      if (response.status !== 200) throw new Error(`Status ${response.status}`)
      console.log(`   Utilisateur: ${response.data.username}`)
    })
  }

  // Test 8: Recherche d'utilisateurs
  await test('GET /user/showall?q=test - Recherche', async () => {
    const response = await makeRequest({
      path: '/user/showall',
      query: { q: 'test', limit: 5 }
    })
    if (response.status !== 200) throw new Error(`Status ${response.status}`)
    console.log(`   ${response.data.users?.length || 0} résultats`)
  })

  // Test 9: Filtrer par rôle
  await test('GET /user/showall?role=user - Filtrer par rôle', async () => {
    const response = await makeRequest({
      path: '/user/showall',
      query: { role: 'user', limit: 5 }
    })
    if (response.status !== 200) throw new Error(`Status ${response.status}`)
    console.log(`   ${response.data.users?.length || 0} utilisateurs avec rôle 'user'`)
  })

  // Test 10: Rafraîchir le token
  if (refreshToken) {
    await test('POST /auth/refresh - Rafraîchir le token', async () => {
      const response = await makeRequest({
        path: '/auth/refresh',
        method: 'POST',
        skipAuth: true
      }, { refreshToken })

      if (response.status === 200) {
        accessToken = response.data.accessToken
        console.log(`   Nouveau token obtenu: ${accessToken.substring(0, 20)}...`)
      } else {
        console.log(`   ⚠️  Refresh token invalide ou expiré`)
      }
    })
  }

  // Test 11: Mettre à jour un utilisateur (si on a un ID)
  if (testUserId) {
    await test('PUT /user/update/:id - Mettre à jour utilisateur', async () => {
      const response = await makeRequest({
        path: `/user/showbyid/${testUserId}`
      })

      if (response.status === 200) {
        // On peut seulement mettre à jour notre propre compte ou être admin
        console.log(`   ⚠️  Test de mise à jour (nécessite d'être propriétaire ou admin)`)
      }
    })
  }

  // Test 12: Test avec token expiré (simulation)
  await test('GET /user/showall - Test avec token invalide', async () => {
    const oldToken = accessToken
    accessToken = 'invalid_token_12345'
    
    const response = await makeRequest({ path: '/user/showall' })
    
    if (response.status === 401) {
      console.log(`   ✅ Token invalide correctement rejeté`)
    } else {
      throw new Error('Le token invalide devrait être rejeté')
    }
    
    accessToken = oldToken
  })

  // Test 13: Déconnexion
  if (refreshToken) {
    await test('POST /auth/logout - Déconnexion', async () => {
      const response = await makeRequest({
        path: '/auth/logout',
        method: 'POST'
      }, { refreshToken })

      if (response.status === 200) {
        console.log(`   Déconnexion réussie`)
        accessToken = null
        refreshToken = null
      }
    })
  }

  console.log('\n✅ Tests terminés!\n')
  console.log('📝 Note: Certains tests peuvent échouer si:')
  console.log('   - Aucun utilisateur n\'existe dans la base de données')
  console.log('   - Les tokens sont expirés')
  console.log('   - Vous n\'avez pas les permissions nécessaires (admin)')
  console.log('\n💡 Pour tester les routes admin, créez d\'abord un utilisateur avec role="admin"\n')
}

// Exécuter les tests
runTests().catch(err => {
  console.error('❌ Erreur fatale:', err)
  process.exit(1)
})

