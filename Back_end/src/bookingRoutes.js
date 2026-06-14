const express = require("express");
const router = express.Router();
const bookingController = require("./controllers/booking.controller");
const { authenticateToken } = require("./middleware/auth");

router.get("/bookingList", authenticateToken, bookingController.bookingList);
router.post("/addBooking", bookingController.addBooking);
router.put("/:id/bookingUpdate", authenticateToken, bookingController.bookingUpdate);
router.delete("/:id", authenticateToken, bookingController.deleteBooking);
router.put("/:id/confirmBooking", authenticateToken, bookingController.confirmBooking);
router.put("/:id/cancelBooking", authenticateToken, bookingController.cancelBooking);

module.exports = router;
