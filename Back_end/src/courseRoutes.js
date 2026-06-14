const express = require("express");
const router = express.Router();
const courseController = require("./controllers/course.controller");
const { authenticateToken } = require("./middleware/auth");

// CRUD
router.get("/list", authenticateToken, courseController.getCourseList);
router.post("/", authenticateToken, courseController.createCourse);
router.put("/:id", authenticateToken, courseController.updateCourse);
router.delete("/:id", authenticateToken, courseController.deleteCourse);

module.exports = router;
