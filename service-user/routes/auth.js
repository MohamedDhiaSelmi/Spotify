const express = require("express");
const router = express.Router();
const authController = require("../controller/authController");
const { authenticate } = require("../middl/auth");
const rateLimit = require("express-rate-limit");

// Rate limiter pour les routes d'authentification (protection contre brute force)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 tentatives par IP
  message: {
    success: false,
    message: "Trop de tentatives. Veuillez réessayer dans 15 minutes."
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Route test
router.get("/test", (req, res) => {
  res.json({ message: "API Authentification - Fonctionne" });
});

// Routes publiques (avec rate limiting)
router.post("/register", authLimiter, authController.register);
router.post("/login", authLimiter, authController.login);
router.post("/refresh", authController.refresh);
router.post("/forgot-password", authLimiter, authController.requestPasswordReset);
router.post("/reset-password", authLimiter, authController.resetPassword);

// Routes protégées (nécessitent une authentification)
router.post("/logout", authenticate, authController.logout);
router.post("/logout-all", authenticate, authController.logoutAll);
router.get("/me", authenticate, authController.getMe);

module.exports = router;

