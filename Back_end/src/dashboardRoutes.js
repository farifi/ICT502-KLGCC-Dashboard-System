const express = require("express");
const router = express.Router();
const dashboardController = require('./controllers/dashboard.controller');
const { authenticateToken } = require('./middleware/auth');

router.get("/total-rental-revenue", authenticateToken, dashboardController.totalRentalRevenue);
router.get("/rental-trends", authenticateToken, dashboardController.rentalTrend);
router.get("/average-rental-price-per-staff", authenticateToken, dashboardController.averageRentalPricePerStaff);
router.get("/rentals-by-car-type", authenticateToken, dashboardController.rentalCountByCarType);
router.get("/service-frequency", authenticateToken, dashboardController.serviceFrequency);

module.exports = router;