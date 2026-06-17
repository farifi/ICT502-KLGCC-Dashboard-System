const express = require('express');
const router = express.Router();
const customerController = require('./controllers/customer.controller');
const { authenticateToken } = require('./middleware/auth');

router.get("/customerList",  authenticateToken, customerController.customerList);
router.get("/memberList",    authenticateToken, customerController.memberList);
router.get("/walkinList",    authenticateToken, customerController.walkinList);
router.post("/add",          authenticateToken, customerController.createCustomer);
router.put("/:id",           authenticateToken, customerController.updateCustomer);
router.delete("/:id",        authenticateToken, customerController.deleteCustomer);

module.exports = router;