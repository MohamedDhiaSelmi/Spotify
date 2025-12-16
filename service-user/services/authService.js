const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const crypto = require('crypto')
const User = require('../model/user')
const emailService = require('./emailService')

// Configuration JWT
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key-change-in-production'
const ACCESS_TOKEN_EXPIRY = process.env.ACCESS_TOKEN_EXPIRY || '15m' // 15 minutes
const REFRESH_TOKEN_EXPIRY = process.env.REFRESH_TOKEN_EXPIRY || '7d' // 7 jours

// Générer un access token
function generateAccessToken(user) {
  const payload = {
    userId: user._id.toString(),
    username: user.username,
    email: user.email,
    role: user.role
  }
  
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRY,
    issuer: 'sportify-api',
    audience: 'sportify-client'
  })
}

// Générer un refresh token
function generateRefreshToken(user) {
  const payload = {
    userId: user._id.toString(),
    type: 'refresh'
  }
  
  return jwt.sign(payload, JWT_REFRESH_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRY,
    issuer: 'sportify-api',
    audience: 'sportify-client'
  })
}

// Vérifier un access token
function verifyAccessToken(token) {
  try {
    if (!token) {
      throw new Error('Token manquant')
    }

    // Décoder le token sans vérification pour voir s'il est bien formé
    let decoded
    try {
      decoded = jwt.decode(token)
      if (!decoded) {
        throw new Error('Token mal formé')
      }
    } catch (decodeErr) {
      throw new Error('Token mal formé ou invalide')
    }

    // Vérifier le token avec le secret
    try {
      return jwt.verify(token, JWT_SECRET, {
        issuer: 'sportify-api',
        audience: 'sportify-client'
      })
    } catch (verifyErr) {
      // Gestion des erreurs spécifiques
      if (verifyErr.name === 'TokenExpiredError') {
        throw new Error('Token expiré. Veuillez vous reconnecter ou utiliser le refresh token.')
      } else if (verifyErr.name === 'JsonWebTokenError') {
        throw new Error('Token invalide. Signature incorrecte.')
      } else if (verifyErr.name === 'NotBeforeError') {
        throw new Error('Token pas encore valide.')
      } else {
        throw new Error(`Erreur de vérification du token: ${verifyErr.message}`)
      }
    }
  } catch (err) {
    // Si c'est déjà notre erreur personnalisée, la relancer
    if (err.message && !err.message.includes('Token invalide ou expiré')) {
      throw err
    }
    throw new Error('Token invalide ou expiré')
  }
}

// Vérifier un refresh token
function verifyRefreshToken(token) {
  try {
    if (!token) {
      throw new Error('Refresh token manquant')
    }

    // Décoder le token sans vérification
    let decoded
    try {
      decoded = jwt.decode(token)
      if (!decoded) {
        throw new Error('Refresh token mal formé')
      }
    } catch (decodeErr) {
      throw new Error('Refresh token mal formé ou invalide')
    }

    // Vérifier le token avec le secret
    try {
      return jwt.verify(token, JWT_REFRESH_SECRET, {
        issuer: 'sportify-api',
        audience: 'sportify-client'
      })
    } catch (verifyErr) {
      // Gestion des erreurs spécifiques
      if (verifyErr.name === 'TokenExpiredError') {
        throw new Error('Refresh token expiré. Veuillez vous reconnecter.')
      } else if (verifyErr.name === 'JsonWebTokenError') {
        throw new Error('Refresh token invalide. Signature incorrecte.')
      } else {
        throw new Error(`Erreur de vérification du refresh token: ${verifyErr.message}`)
      }
    }
  } catch (err) {
    // Si c'est déjà notre erreur personnalisée, la relancer
    if (err.message && !err.message.includes('Refresh token invalide ou expiré')) {
      throw err
    }
    throw new Error('Refresh token invalide ou expiré')
  }
}

// Authentifier un utilisateur (login)
async function authenticateUser(email, password) {
  // Trouver l'utilisateur par email ou username
  const user = await User.findOne({
    $or: [
      { email: email },
      { username: email }
    ]
  })

  if (!user) {
    throw new Error('Email/Username ou mot de passe incorrect')
  }

  // Vérifier le mot de passe
  const isPasswordValid = await bcrypt.compare(password, user.password)
  if (!isPasswordValid) {
    // Envoyer un email de réinitialisation si le mot de passe est incorrect
    try {
      await sendPasswordResetEmailForUser(user)
    } catch (emailError) {
      // Ne pas bloquer l'erreur si l'email échoue, juste logger
      console.error('Erreur lors de l\'envoi de l\'email de réinitialisation:', emailError.message)
    }
    throw new Error('Email/Username ou mot de passe incorrect')
  }

  // Générer les tokens
  const accessToken = generateAccessToken(user)
  const refreshToken = generateRefreshToken(user)

  // Sauvegarder le refresh token dans la base de données
  user.refreshTokens.push(refreshToken)
  // Garder seulement les 5 derniers refresh tokens (pour sécurité multi-appareils)
  if (user.refreshTokens.length > 5) {
    user.refreshTokens = user.refreshTokens.slice(-5)
  }
  await user.save()

  // Retourner les informations utilisateur (sans le mot de passe)
  const userInfo = {
    _id: user._id,
    username: user.username,
    email: user.email,
    role: user.role,
    cin: user.cin,
    specialite: user.specialite,
    date_creation: user.date_creation
  }

  return {
    user: userInfo,
    accessToken,
    refreshToken
  }
}

// Enregistrer un nouvel utilisateur (register)
async function registerUser(userData) {
  // Vérifier si l'utilisateur existe déjà
  const existingUser = await User.findOne({
    $or: [
      { email: userData.email },
      { username: userData.username },
      { cin: userData.cin }
    ]
  })

  if (existingUser) {
    if (existingUser.email === userData.email) {
      throw new Error('Cet email est déjà utilisé')
    }
    if (existingUser.username === userData.username) {
      throw new Error('Ce nom d\'utilisateur est déjà utilisé')
    }
    if (existingUser.cin === userData.cin) {
      throw new Error('Ce CIN est déjà utilisé')
    }
  }

  // Créer le nouvel utilisateur
  const user = new User(userData)
  await user.save()

  // Générer les tokens
  const accessToken = generateAccessToken(user)
  const refreshToken = generateRefreshToken(user)

  // Sauvegarder le refresh token
  user.refreshTokens.push(refreshToken)
  await user.save()

  // Retourner les informations utilisateur (sans le mot de passe)
  const userInfo = {
    _id: user._id,
    username: user.username,
    email: user.email,
    role: user.role,
    cin: user.cin,
    specialite: user.specialite,
    date_creation: user.date_creation
  }

  return {
    user: userInfo,
    accessToken,
    refreshToken
  }
}

// Rafraîchir un access token
async function refreshAccessToken(refreshToken) {
  // Vérifier le refresh token
  const decoded = verifyRefreshToken(refreshToken)

  // Trouver l'utilisateur
  const user = await User.findById(decoded.userId)
  if (!user) {
    throw new Error('Utilisateur non trouvé')
  }

  // Vérifier que le refresh token est dans la liste de l'utilisateur
  if (!user.refreshTokens.includes(refreshToken)) {
    throw new Error('Refresh token invalide')
  }

  // Générer un nouveau access token
  const accessToken = generateAccessToken(user)

  return { accessToken }
}

// Déconnecter un utilisateur (supprimer le refresh token)
async function logoutUser(userId, refreshToken) {
  const user = await User.findById(userId)
  if (!user) {
    throw new Error('Utilisateur non trouvé')
  }

  // Supprimer le refresh token de la liste
  user.refreshTokens = user.refreshTokens.filter(token => token !== refreshToken)
  await user.save()

  return { message: 'Déconnexion réussie' }
}

// Déconnecter tous les appareils (supprimer tous les refresh tokens)
async function logoutAllDevices(userId) {
  const user = await User.findById(userId)
  if (!user) {
    throw new Error('Utilisateur non trouvé')
  }

  user.refreshTokens = []
  await user.save()

  return { message: 'Déconnexion de tous les appareils réussie' }
}

// Générer un token de réinitialisation de mot de passe
function generateResetToken() {
  return crypto.randomBytes(32).toString('hex')
}

// Envoyer un email de réinitialisation de mot de passe (version avec objet user)
async function sendPasswordResetEmailForUser(user) {
  // Générer le token de réinitialisation
  const resetToken = generateResetToken()
  const resetTokenExpiry = new Date()
  resetTokenExpiry.setHours(resetTokenExpiry.getHours() + 1) // Expire dans 1 heure

  // Sauvegarder le token dans la base de données
  user.resetPasswordToken = resetToken
  user.resetPasswordExpires = resetTokenExpiry
  await user.save()

  // Construire l'URL de réinitialisation (vous devrez ajuster selon votre frontend)
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`

  // Envoyer l'email
  const emailSubject = 'Réinitialisation de votre mot de passe - Sportify'
  const emailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
      <div style="background-color: #1DB954; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="margin: 0; font-size: 28px;">🔒 Réinitialisation de mot de passe</h1>
      </div>
      <div style="background-color: white; padding: 30px; border-radius: 0 0 8px 8px;">
        <p style="font-size: 16px; color: #333; line-height: 1.6;">
          Bonjour ${user.username || 'Utilisateur'},
        </p>
        <p style="font-size: 16px; color: #333; line-height: 1.6;">
          Nous avons détecté une tentative de connexion avec un mot de passe incorrect pour votre compte.
        </p>
        <p style="font-size: 16px; color: #333; line-height: 1.6;">
          Si vous avez oublié votre mot de passe, vous pouvez le réinitialiser en cliquant sur le bouton ci-dessous :
        </p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #1DB954; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
            Réinitialiser mon mot de passe
          </a>
        </div>
        <p style="font-size: 14px; color: #666; line-height: 1.6;">
          Ou copiez-collez ce lien dans votre navigateur :<br>
          <a href="${resetUrl}" style="color: #1DB954; word-break: break-all;">${resetUrl}</a>
        </p>
        <div style="background-color: #fff3cd; padding: 15px; border-left: 4px solid #ffc107; margin: 20px 0;">
          <p style="margin: 0; font-size: 14px; color: #856404;">
            <strong>⚠️ Important :</strong> Ce lien est valide pendant 1 heure seulement. Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.
          </p>
        </div>
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        <p style="font-size: 12px; color: #999; text-align: center; margin: 0;">
          Cet email a été envoyé automatiquement suite à une tentative de connexion échouée.
        </p>
      </div>
    </div>
  `
  const emailText = `
Réinitialisation de mot de passe - Sportify

Bonjour ${user.username || 'Utilisateur'},

Nous avons détecté une tentative de connexion avec un mot de passe incorrect pour votre compte.

Si vous avez oublié votre mot de passe, vous pouvez le réinitialiser en visitant ce lien :
${resetUrl}

⚠️ Important : Ce lien est valide pendant 1 heure seulement. Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.

Cet email a été envoyé automatiquement suite à une tentative de connexion échouée.
  `

  await emailService.sendEmail({
    to: user.email,
    subject: emailSubject,
    html: emailHtml,
    text: emailText
  })
}

// Envoyer un email de réinitialisation de mot de passe (version avec email/username)
async function sendPasswordResetEmail(email, username) {
  const user = await User.findOne({
    $or: [
      { email: email },
      { username: email }
    ]
  })

  if (!user) {
    // Ne pas révéler que l'utilisateur n'existe pas pour des raisons de sécurité
    return
  }

  await sendPasswordResetEmailForUser(user)
}

// Réinitialiser le mot de passe avec un token
async function resetPassword(token, newPassword) {
  // Trouver l'utilisateur avec un token valide et non expiré
  const user = await User.findOne({
    resetPasswordToken: token,
    resetPasswordExpires: { $gt: new Date() } // Le token n'est pas expiré
  })

  if (!user) {
    throw new Error('Token de réinitialisation invalide ou expiré')
  }

  // Mettre à jour le mot de passe
  user.password = newPassword
  user.resetPasswordToken = null
  user.resetPasswordExpires = null
  await user.save()

  return { message: 'Mot de passe réinitialisé avec succès' }
}

// Demander une réinitialisation de mot de passe (pour une demande manuelle)
async function requestPasswordReset(email) {
  const user = await User.findOne({
    $or: [
      { email: email },
      { username: email }
    ]
  })

  if (!user) {
    // Ne pas révéler que l'utilisateur n'existe pas pour des raisons de sécurité
    // Mais on peut quand même retourner un succès pour éviter l'énumération d'emails
    return { message: 'Si cet email existe, un lien de réinitialisation a été envoyé' }
  }

  // Générer le token de réinitialisation
  const resetToken = generateResetToken()
  const resetTokenExpiry = new Date()
  resetTokenExpiry.setHours(resetTokenExpiry.getHours() + 1) // Expire dans 1 heure

  // Sauvegarder le token dans la base de données
  user.resetPasswordToken = resetToken
  user.resetPasswordExpires = resetTokenExpiry
  await user.save()

  // Construire l'URL de réinitialisation
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`

  // Envoyer l'email
  const emailSubject = 'Réinitialisation de votre mot de passe - Sportify'
  const emailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
      <div style="background-color: #1DB954; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="margin: 0; font-size: 28px;">🔒 Réinitialisation de mot de passe</h1>
      </div>
      <div style="background-color: white; padding: 30px; border-radius: 0 0 8px 8px;">
        <p style="font-size: 16px; color: #333; line-height: 1.6;">
          Bonjour ${user.username || 'Utilisateur'},
        </p>
        <p style="font-size: 16px; color: #333; line-height: 1.6;">
          Vous avez demandé la réinitialisation de votre mot de passe.
        </p>
        <p style="font-size: 16px; color: #333; line-height: 1.6;">
          Cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe :
        </p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #1DB954; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
            Réinitialiser mon mot de passe
          </a>
        </div>
        <p style="font-size: 14px; color: #666; line-height: 1.6;">
          Ou copiez-collez ce lien dans votre navigateur :<br>
          <a href="${resetUrl}" style="color: #1DB954; word-break: break-all;">${resetUrl}</a>
        </p>
        <div style="background-color: #fff3cd; padding: 15px; border-left: 4px solid #ffc107; margin: 20px 0;">
          <p style="margin: 0; font-size: 14px; color: #856404;">
            <strong>⚠️ Important :</strong> Ce lien est valide pendant 1 heure seulement. Si vous n'avez pas demandé cette réinitialisation, ignorez cet email et votre mot de passe restera inchangé.
          </p>
        </div>
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        <p style="font-size: 12px; color: #999; text-align: center; margin: 0;">
          Cet email a été envoyé suite à votre demande de réinitialisation de mot de passe.
        </p>
      </div>
    </div>
  `
  const emailText = `
Réinitialisation de mot de passe - Sportify

Bonjour ${user.username || 'Utilisateur'},

Vous avez demandé la réinitialisation de votre mot de passe.

Cliquez sur ce lien pour créer un nouveau mot de passe :
${resetUrl}

⚠️ Important : Ce lien est valide pendant 1 heure seulement. Si vous n'avez pas demandé cette réinitialisation, ignorez cet email et votre mot de passe restera inchangé.

Cet email a été envoyé suite à votre demande de réinitialisation de mot de passe.
  `

  await emailService.sendEmail({
    to: user.email,
    subject: emailSubject,
    html: emailHtml,
    text: emailText
  })

  return { message: 'Si cet email existe, un lien de réinitialisation a été envoyé' }
}

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  authenticateUser,
  registerUser,
  refreshAccessToken,
  logoutUser,
  logoutAllDevices,
  sendPasswordResetEmail,
  resetPassword,
  requestPasswordReset
}

