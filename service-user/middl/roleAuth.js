// Middleware pour vérifier les rôles et permissions

// Vérifier si l'utilisateur a un rôle spécifique
const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentification requise'
      })
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Accès refusé. Rôle requis: ${allowedRoles.join(' ou ')}`
      })
    }

    next()
  }
}

// Vérifier si l'utilisateur est admin
const requireAdmin = requireRole('admin')

// Vérifier si l'utilisateur est coach ou admin
const requireCoachOrAdmin = requireRole('coach', 'admin')

// Vérifier si l'utilisateur est propriétaire de la ressource ou admin
const requireOwnerOrAdmin = (userIdParam = 'id') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentification requise'
      })
    }

    // Admin a toujours accès
    if (req.user.role === 'admin') {
      return next()
    }

    // Vérifier si l'utilisateur est propriétaire
    const resourceUserId = req.params[userIdParam] || req.body.userId || req.query.userId
    
    if (resourceUserId && resourceUserId.toString() === req.user.userId.toString()) {
      return next()
    }

    return res.status(403).json({
      success: false,
      message: 'Accès refusé. Vous devez être propriétaire de cette ressource ou administrateur.'
    })
  }
}

module.exports = {
  requireRole,
  requireAdmin,
  requireCoachOrAdmin,
  requireOwnerOrAdmin
}

