const express = require("express");
const router = express.Router();
const userController = require("./user.controller");
const { authenticateToken } = require("../../middlewares/auth.middleware");

router.get("/me", authenticateToken, userController.getProfile);

module.exports = router;
