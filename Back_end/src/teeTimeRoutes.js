const express = require("express");
const router = express.Router();
const teeTimeController = require("./controllers/teeTime.controller");
const { authenticateToken } = require("./middleware/auth");

// For Booking: 
router.get("/list", authenticateToken, teeTimeController.teeTimeList);

// For frontend table: Tee Time with Course Name
router.get("/listWithCourse", authenticateToken, teeTimeController.teeTimeListWithCourse);
router.post("/", authenticateToken, teeTimeController.createTeeTime);
router.put("/:id", authenticateToken, teeTimeController.updateTeeTime);
router.delete("/:id", authenticateToken, teeTimeController.deleteTeeTime);

module.exports = router;
