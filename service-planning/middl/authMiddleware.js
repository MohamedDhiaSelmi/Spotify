const jwt = require("jsonwebtoken");

// ⚠️ Même secret que dans generateAccessToken()
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";

/**
 * Middleware : Vérifie que l'utilisateur est authentifié
 */
function authenticateToken(req, res, next) {
  try {
    let token = null;

    // 1️⃣ Depuis le header Authorization: Bearer <token>
    const authHeader = req.headers["authorization"];
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1].trim();
    }

    // 2️⃣ Depuis les cookies
    if (!token && req.cookies?.accessToken) {
      token = req.cookies.accessToken.trim();
    }

    // 3️⃣ Depuis le body
    if (!token && req.body?.token) {
      token = req.body.token.trim();
    }

    // Aucun token trouvé
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "❌ Vous n'êtes pas authentifié. Vous ne pouvez pas accéder à cette ressource."
      });
    }

    // Vérification du token
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: "sportify-api",
      audience: "sportify-client"
    });

    // Ajouter les infos utilisateur à la requête
    req.user = {
      userId: decoded.userId,
      username: decoded.username,
      email: decoded.email,
      role: decoded.role
    };

    next();
  } catch (err) {
    // Token expiré
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "❌ Session expirée. Vous devez vous reconnecter."
      });
    }

    // Token invalide
    return res.status(403).json({
      success: false,
      message: "❌ Token invalide. Vous n'êtes pas authentifié."
    });
  }
}

/**
 * Middleware : Vérifie le rôle
 */
function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ success: false, message: "Authentification requise." });
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Accès refusé. Rôle requis : ${allowedRoles.join(" ou ")}`
      });
    }
    next();
  };
}

module.exports = { authenticateToken, requireRole };
