const express = require("express");
const router = express.Router();
const customerController = require("./controllers/customer.controller");
const { authenticateToken } = require("./middleware/auth");

router.get("/list", authenticateToken, customerController.customerList); // Specified for booking

router.get("/customerList", authenticateToken, customerController.customerListPaged);
router.get("/memberList", authenticateToken, customerController.memberCustomerList);
router.get("/walkinList", authenticateToken, customerController.walkinCustomerList);

router.post("/add", authenticateToken, customerController.addCustomer);
router.put("/:id", authenticateToken, customerController.updateCustomer);
router.delete("/:id", authenticateToken, customerController.deleteCustomer);

module.exports = router;
