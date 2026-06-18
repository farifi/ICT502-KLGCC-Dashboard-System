const express = require("express");
const router = express.Router();

const serviceController = require("./controllers/service.controller");
const { authenticateToken } = require("./middleware/auth");

router.get("/",      serviceController.getAllServices);
router.post("/",     authenticateToken, serviceController.createService);
router.put("/:id",   authenticateToken, serviceController.updateService);
router.delete("/:id",authenticateToken, serviceController.deleteService);

module.exports = router;