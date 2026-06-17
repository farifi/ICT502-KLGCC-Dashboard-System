const express = require("express");
const router = express.Router();

const equipmentController = require("./controllers/equipment.controller");
const { authenticateToken } = require("./middleware/auth");

router.get("/", equipmentController.getAllEquipment);
router.post("/", authenticateToken, equipmentController.createEquipment);
router.put("/:id", authenticateToken, equipmentController.updateEquipment);
router.delete("/:id", authenticateToken, equipmentController.deleteEquipment);

module.exports = router;
