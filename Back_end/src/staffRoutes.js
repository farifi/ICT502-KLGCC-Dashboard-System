const express = require('express');
const router = express.Router();
const staffController = require('./controllers/staff.controller');
const { authenticateToken } = require('./middleware/auth');

// =============================
// STAFF ROUTES
// =============================
router.get("/staffList", staffController.staffList);
router.post("/createStaff", authenticateToken, staffController.createStaff);
router.put("/:id", authenticateToken, staffController.updateStaff);
router.delete("/:id", authenticateToken, staffController.deleteStaff);

// =============================
// DRIVER ROUTES (NEW)
// =============================
router.get("/driverList", staffController.driverList);

// OPTIONAL (if you implemented Option B fully)
router.post("/createDriver", authenticateToken, staffController.createDriver);
router.put("/driver/:id", authenticateToken, staffController.updateDriver);
router.delete("/driver/:id", authenticateToken, staffController.deleteDriver);

module.exports = router;