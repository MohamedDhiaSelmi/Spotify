const authService = require('../services/authService')
const User = require('../model/user')

// Middleware d'authentification - vérifie si l'utilisateur est connecté
const authenticate = async (req, res, next) => {
  try {
    // Récupérer le token depuis le header Authorization ou depuis les cookies
    let token = null

    // Vérifier le header Authorization (Bearer token)
    const authHeader = req.headers.authorization
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7) // Enlever "Bearer "
    }
    // Sinon, vérifier les cookies
    else if (req.cookies && req.cookies.accessToken) {
      token = req.cookies.accessToken
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Accès non autorisé. Token manquant.'
      })
    }

    // Vérifier et décoder le token
    let decoded
    try {
      decoded = authService.verifyAccessToken(token)
    } catch (tokenErr) {
      // Si le token est expiré, suggérer d'utiliser le refresh token
      if (tokenErr.message && tokenErr.message.includes('expiré')) {
        return res.status(401).json({
          success: false,
          message: tokenErr.message,
          error: 'TOKEN_EXPIRED',
          hint: 'Utilisez /auth/refresh pour obtenir un nouveau token'
        })
      }
      // Autre erreur de token
      return res.status(401).json({
        success: false,
        message: tokenErr.message || 'Token invalide',
        error: 'INVALID_TOKEN'
      })
    }

    // Vérifier que le decoded contient userId
    if (!decoded || !decoded.userId) {
      return res.status(401).json({
        success: false,
        message: 'Token invalide: informations utilisateur manquantes',
        error: 'INVALID_TOKEN_PAYLOAD'
      })
    }

    // Récupérer l'utilisateur depuis la base de données
    let user
    try {
      user = await User.findById(decoded.userId).select('-password -refreshTokens')
    } catch (dbErr) {
      console.error('Erreur lors de la récupération de l\'utilisateur:', dbErr)
      return res.status(500).json({
        success: false,
        message: 'Erreur serveur lors de la vérification de l\'authentification',
        error: 'DATABASE_ERROR'
      })
    }
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Utilisateur non trouvé. Le token peut être associé à un compte supprimé.',
        error: 'USER_NOT_FOUND'
      })
    }

    // Ajouter les informations de l'utilisateur à la requête
    req.user = {
      userId: user._id.toString(),
      username: user.username,
      email: user.email,
      role: user.role,
      user: user // L'objet utilisateur complet
    }

    next()
  } catch (err) {
    console.error('Erreur dans le middleware authenticate:', err)
    return res.status(401).json({
      success: false,
      message: err.message || 'Erreur d\'authentification',
      error: 'AUTHENTICATION_ERROR'
    })
  }
}

// Middleware optionnel - ajoute l'utilisateur si un token est présent, mais ne bloque pas si absent
const optionalAuth = async (req, res, next) => {
  try {
    let token = null

    const authHeader = req.headers.authorization
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7)
    } else if (req.cookies && req.cookies.accessToken) {
      token = req.cookies.accessToken
    }

    if (token) {
      const decoded = authService.verifyAccessToken(token)
      const user = await User.findById(decoded.userId).select('-password -refreshTokens')
      
      if (user) {
        req.user = {
          userId: user._id.toString(),
          username: user.username,
          email: user.email,
          role: user.role,
          user: user
        }
      }
    }

    next()
  } catch (err) {
    // En cas d'erreur, continuer sans authentification (c'est optionnel)
    next()
  }
}

module.exports = {
  authenticate,
  optionalAuth
}

