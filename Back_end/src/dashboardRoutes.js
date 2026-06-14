const express = require("express");
const router = express.Router();
const dashboardController = require('./controllers/dashboard.controller');
const { authenticateToken } = require('./middleware/auth');

router.get("/total-bookings-revenue", authenticateToken, dashboardController.totalBookingsRevenue);
router.get("/booking-trends", authenticateToken, dashboardController.bookingTrend);   
router.get("/average-booking-price-per-staff", authenticateToken,dashboardController.averageBookingPricePerStaff);
router.get("/bookings-by-course", authenticateToken, dashboardController.bookingCountByCourse);
router.get("/equipment-usage-count", authenticateToken, dashboardController.equipmentUsageCount);   

module.exports = router;
