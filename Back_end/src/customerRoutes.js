const express = require("express");
const router = express.Router();

const customerController = require("./controllers/customer.controller");
const { authenticateToken } = require("./middleware/auth");

// Customer CRUD
router.get(
"/customerList",
authenticateToken,
customerController.customerListPaged
);

router.post(
"/add",
authenticateToken,
customerController.addCustomer
);

router.put(
"/:id",
authenticateToken,
customerController.updateCustomer
);

router.delete(
"/:id",
authenticateToken,
customerController.deleteCustomer
);

module.exports = router;
