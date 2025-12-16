const express = require("express");
const router = express.Router();
const userController = require("../controller/userController");
const validate = require("../middl/validate");
const { authenticate } = require("../middl/auth");
const { requireAdmin, requireOwnerOrAdmin } = require("../middl/roleAuth");

// Route test
router.get("/test", (req, res) => {
  res.json({ message: "Spotify - Gestion des utilisateurs fonctionne" }); 
});

// Routes CRUD (protected)
// - POST /add : admin only
router.post("/add", authenticate, requireAdmin, validate, userController.add);
// - GET list/details : authenticated users
router.get("/showall", authenticate, userController.showAll);
router.get("/showbyid/:id", authenticate, userController.showById);
router.get("/showbyusername/:username", authenticate, userController.showByUsername);
router.get("/showbyrole/:role", authenticate, userController.showByRole);
// - DELETE/PUT : admin only
router.delete("/delete/:id", authenticate, requireAdmin, userController.deleteUser);
// allow owner or admin to update
router.put("/update/:id", authenticate, requireOwnerOrAdmin(), userController.updateUser);
// - Advanced features : admin only
router.get("/stats", authenticate, requireAdmin, userController.getStats);
router.get("/export", authenticate, requireAdmin, userController.exportUsers);

router.get("/showtwig", (req, res) => {
  res.render("show");
});

module.exports = router;