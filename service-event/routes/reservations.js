const express = require("express");
const router = express.Router();
const reservationcontroller = require("../controller/reservationController");
const validateReservation = require("../middl/validateReservation");
const { authenticateToken } = require('../middl/authMiddleware');

router.get("/testReservations", (req, res) => {
  console.log("reservations route ok");
});

router.post("/addReservation",authenticateToken,validateReservation, reservationcontroller.add);

router.get("/getReservationsByEvent/:eventId",authenticateToken, reservationcontroller.showByEvent);

router.delete("/deleteReservation/:id",authenticateToken,reservationcontroller.cancel);

module.exports = router;
