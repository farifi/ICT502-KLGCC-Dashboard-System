const express = require("express");
const router = express.Router();
const paymentController = require("./controllers/payment.controller");
const { authenticateToken } = require("./middleware/auth");

// CRUD
router.get("/list", authenticateToken, paymentController.getPaymentList);
router.post("/", authenticateToken, paymentController.createPayment);
router.put("/:id", authenticateToken, paymentController.updatePayment);
router.delete("/:id", authenticateToken, paymentController.deletePayment);

module.exports = router;