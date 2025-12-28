const express = require("express");
const router = express.Router();
const { isLoggedIn, isHost } = require("../middleware");
const bookings = require("../controllers/bookings");

// Create booking
router.post("/:id/book", isLoggedIn, bookings.createBooking);

// Unified Dashboard (host bookings + my trips)
router.get("/dashboard", isLoggedIn, bookings.dashboard);

// Accept / Reject booking
router.post("/:id/accept", isLoggedIn, isHost, bookings.acceptBooking);
router.post("/:id/reject", isLoggedIn, isHost, bookings.rejectBooking);
// 🆕 Send message on a booking
router.post("/:id/message", isLoggedIn, bookings.sendMessage);

module.exports = router;
