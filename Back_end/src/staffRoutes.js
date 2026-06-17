const express = require('express');
const router = express.Router();
const staffController = require('./controllers/staff.controller');
const { authenticateToken } = require('./middleware/auth');

router.get("/staffList",    authenticateToken, staffController.staffList);
router.get("/driverList",   authenticateToken, staffController.driverList);     // ✅ new
router.get("/nonDriverList",authenticateToken, staffController.nonDriverList);  // ✅ new
router.post("/createStaff", authenticateToken, staffController.createStaff);
router.put("/:id",          authenticateToken, staffController.updateStaff);
router.delete("/:id",       authenticateToken, staffController.deleteStaff);

module.exports = router;