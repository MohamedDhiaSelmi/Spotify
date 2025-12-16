/**
 * Script pour générer des secrets JWT sécurisés
 * Génère des secrets aléatoires de 64 caractères
 */

const crypto = require('crypto')

function generateSecret(length = 64) {
  return crypto.randomBytes(length).toString('hex')
}

console.log('🔐 Génération de secrets JWT sécurisés...\n')

const jwtSecret = generateSecret(64)
const jwtRefreshSecret = generateSecret(64)

console.log('✅ Secrets générés avec succès!\n')
console.log('📋 Ajoutez ces lignes à votre fichier .env:\n')
console.log('# JWT Configuration')
console.log(`JWT_SECRET=${jwtSecret}`)
console.log(`JWT_REFRESH_SECRET=${jwtRefreshSecret}`)
console.log('')
console.log('# Token Expiry (optionnel)')
console.log('ACCESS_TOKEN_EXPIRY=15m')
console.log('REFRESH_TOKEN_EXPIRY=7d')
console.log('')
console.log('# Environment')
console.log('NODE_ENV=development')
console.log('PORT=3000')
console.log('')
console.log('⚠️  IMPORTANT:')
console.log('   - Ne partagez JAMAIS ces secrets')
console.log('   - Ne commitez JAMAIS le fichier .env dans Git')
console.log('   - Changez ces secrets en production')
console.log('   - Utilisez des secrets différents pour chaque environnement')
console.log('')

