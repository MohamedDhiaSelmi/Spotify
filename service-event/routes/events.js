const express = require("express");
const router = express.Router();

const eventController = require("../controller/eventController");
const { authenticateToken } = require('../middl/authMiddleware');

// CRUD de base
router.post("/addEvent",authenticateToken ,eventController.add);
router.get("/getEvents",authenticateToken ,eventController.showevents);
router.get("/getEventById/:id",authenticateToken , eventController.showeventbyid);
router.patch("/updateEvent/:id", authenticateToken ,eventController.updateevent);
router.delete("/deleteEvent/:id",authenticateToken , eventController.deleteevent);

// 📊 Stats pour un event
// URL finale : /api/events/:id/stats
router.get("/:id/stats", authenticateToken ,eventController.getEventStats);

module.exports = router;
