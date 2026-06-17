const express = require("express");
const router = express.Router();
const carController = require("./controllers/car.controller");
const { authenticateToken } = require("./middleware/auth");

router.get("/carList", authenticateToken, carController.carList);
router.post("/addCar", authenticateToken, carController.addCar);
router.put("/:id/carUpdate", authenticateToken, carController.carUpdate);
router.delete("/:id", authenticateToken, carController.deleteCar);

module.exports = router;