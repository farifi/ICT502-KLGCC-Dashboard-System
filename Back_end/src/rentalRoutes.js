const express = require("express");
const router = express.Router();
const rentalController = require("./controllers/rental.controller");
const { authenticateToken } = require("./middleware/auth");

router.get("/list",            authenticateToken, rentalController.getSimpleRental);
router.get("/listWithDetails", authenticateToken, rentalController.getRentalWithDetails);
router.post("/",               authenticateToken, rentalController.createRental);
router.put("/:id",             authenticateToken, rentalController.updateRental);
router.delete("/:id",          authenticateToken, rentalController.deleteRental);

module.exports = router;