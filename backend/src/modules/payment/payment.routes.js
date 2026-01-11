const express = require("express");
const router = express.Router();
const paymentController = require("./payment.controller");
const authenticateToken = require("../../middlewares/auth.middleware");

// Ödəniş linki yaratmaq
router.post("/create-checkout-session", authenticateToken, paymentController.createCheckoutSession);

// Demo təsdiqləmə (Webhook əvəzi)
router.post("/confirm-payment", authenticateToken, paymentController.confirmPayment);

module.exports = router;
