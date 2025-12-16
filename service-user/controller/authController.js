const authService = require('../services/authService')
const validate = require('../middl/validate')

// Inscription (Register)
async function register(req, res) {
  try {
    const { username, email, password, role, cin, specialite } = req.body

    // Validation des données
    if (!username || !email || !password || !cin) {
      return res.status(400).json({
        success: false,
        message: 'Tous les champs sont requis (username, email, password, cin)'
      })
    }

    // Créer l'utilisateur et générer les tokens
    const result = await authService.registerUser({
      username,
      email,
      password,
      role: role || 'user',
      cin,
      specialite
    })

    // Optionnel: définir les tokens dans des cookies HTTP-only (plus sécurisé)
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // HTTPS seulement en production
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 jours
    }

    res.cookie('accessToken', result.accessToken, cookieOptions)
    res.cookie('refreshToken', result.refreshToken, cookieOptions)

    res.status(201).json({
      success: true,
      message: 'Inscription réussie',
      user: result.user,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken
    })
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message || 'Erreur lors de l\'inscription',
      error: err.message
    })
  }
}

// Connexion (Login)
async function login(req, res) {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email/Username et mot de passe sont requis'
      })
    }

    // Authentifier l'utilisateur
    const result = await authService.authenticateUser(email, password)

    // Définir les tokens dans des cookies HTTP-only
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 jours
    }

    res.cookie('accessToken', result.accessToken, cookieOptions)
    res.cookie('refreshToken', result.refreshToken, cookieOptions)

    res.status(200).json({
      success: true,
      message: 'Connexion réussie',
      user: result.user,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken
    })
  } catch (err) {
    res.status(401).json({
      success: false,
      message: err.message || 'Erreur lors de la connexion',
      error: err.message
    })
  }
}

// Rafraîchir le token (Refresh Token)
async function refresh(req, res) {
  try {
    // Récupérer le refresh token depuis le body ou les cookies
    let refreshToken = req.body.refreshToken || req.cookies.refreshToken

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token requis'
      })
    }

    // Générer un nouveau access token
    const result = await authService.refreshAccessToken(refreshToken)

    // Mettre à jour le cookie accessToken
    //const cookieOptions = {
     // httpOnly: true,
     // secure: process.env.NODE_ENV === 'production',
     // sameSite: 'strict',
    //  maxAge: 15 * 60 * 1000 // 15 minutes
//    }

    res.cookie('accessToken', result.accessToken, cookieOptions)

    res.status(200).json({
      success: true,
      message: 'Token rafraîchi avec succès',
      accessToken: result.accessToken
    })
  } catch (err) {
    res.status(401).json({
      success: false,
      message: err.message || 'Erreur lors du rafraîchissement du token',
      error: err.message
    })
  }
}

// Déconnexion (Logout)
async function logout(req, res) {
  try {
    const refreshToken = req.body.refreshToken || req.cookies.refreshToken

    if (refreshToken && req.user) {
      await authService.logoutUser(req.user.userId, refreshToken)
    }

    // Supprimer les cookies
    res.clearCookie('accessToken')
    res.clearCookie('refreshToken')

    res.status(200).json({
      success: true,
      message: 'Déconnexion réussie'
    })
  } catch (err) {
    // Même en cas d'erreur, supprimer les cookies
    res.clearCookie('accessToken')
    res.clearCookie('refreshToken')

    res.status(200).json({
      success: true,
      message: 'Déconnexion réussie'
    })
  }
}

// Déconnexion de tous les appareils
async function logoutAll(req, res) {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentification requise'
      })
    }

    await authService.logoutAllDevices(req.user.userId)

    // Supprimer les cookies
    res.clearCookie('accessToken')
    res.clearCookie('refreshToken')

    res.status(200).json({
      success: true,
      message: 'Déconnexion de tous les appareils réussie'
    })
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message || 'Erreur lors de la déconnexion',
      error: err.message
    })
  }
}

// Obtenir les informations de l'utilisateur connecté
async function getMe(req, res) {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentification requise'
      })
    }

    res.status(200).json({
      success: true,
      user: req.user.user
    })
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des informations',
      error: err.message
    })
  }
}

// Demander une réinitialisation de mot de passe
async function requestPasswordReset(req, res) {
  try {
    const { email } = req.body

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email est requis'
      })
    }

    await authService.requestPasswordReset(email)

    // Toujours retourner un succès pour éviter l'énumération d'emails
    res.status(200).json({
      success: true,
      message: 'Si cet email existe, un lien de réinitialisation a été envoyé'
    })
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message || 'Erreur lors de la demande de réinitialisation',
      error: err.message
    })
  }
}

// Réinitialiser le mot de passe avec un token
async function resetPassword(req, res) {
  try {
    const { token, newPassword } = req.body

    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Token et nouveau mot de passe sont requis'
      })
    }

    // Valider la longueur du mot de passe (minimum 6 caractères)
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Le mot de passe doit contenir au moins 6 caractères'
      })
    }

    await authService.resetPassword(token, newPassword)

    res.status(200).json({
      success: true,
      message: 'Mot de passe réinitialisé avec succès'
    })
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message || 'Erreur lors de la réinitialisation du mot de passe',
      error: err.message
    })
  }
}

module.exports = {
  register,
  login,
  refresh,
  logout,
  logoutAll,
  getMe,
  requestPasswordReset,
  resetPassword
}

