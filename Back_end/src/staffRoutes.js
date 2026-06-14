const express = require('express');
const router = express.Router();
const staffController = require('./controllers/staff.controller');
const { authenticateToken } = require('./middleware/auth');

// All staff routes require JWT authentication
router.get("/staffList", authenticateToken, staffController.staffList);
router.delete("/:id", authenticateToken, staffController.deleteStaff);
router.put("/:id", authenticateToken, staffController.updateStaff);
router.post("/createStaff", authenticateToken, staffController.createStaff);

module.exports = router;
