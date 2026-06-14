const express = require('express');
const router = express.Router();
const authController = require('./controllers/auth.controller');
const { authenticateToken } = require('./middleware/auth');

router.post("/signup", authController.signup);
router.post("/login", authController.login);
router.post("/logout", authController.logout);
router.post("/refresh", authController.refreshToken);
// Protected route - requires JWT token in Authorization header
router.get("/protected", authenticateToken, authController.protected);

module.exports = router;
