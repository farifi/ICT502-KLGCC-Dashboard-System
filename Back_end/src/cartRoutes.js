const express = require("express");
const router = express.Router();
const cartController = require("./controllers/cart.controller");
const { authenticateToken } = require("./middleware/auth");

// Lists
router.get("/list", authenticateToken, cartController.getSimpleCart);
router.get("/listWithBooking", authenticateToken, cartController.getCartWithBooking);

// CRUD
router.post("/", authenticateToken, cartController.createCart);
router.put("/:id", authenticateToken, cartController.updateCart);
router.delete("/:id", authenticateToken, cartController.deleteCart);

module.exports = router;
