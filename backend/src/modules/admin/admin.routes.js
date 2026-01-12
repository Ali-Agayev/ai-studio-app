const express = require("express");
const router = express.Router();
const adminController = require("./admin.controller");
const { authenticateToken, isAdmin } = require("../../middlewares/auth.middleware");

router.get("/users", authenticateToken, isAdmin, adminController.getUsers);
router.get("/stats", authenticateToken, isAdmin, adminController.getStats);
router.delete("/users/:id", authenticateToken, isAdmin, adminController.deleteUser);
router.patch("/users/:id/role", authenticateToken, isAdmin, adminController.updateUserRole);

module.exports = router;
