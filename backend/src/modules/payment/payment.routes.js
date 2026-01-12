const express = require("express");
const router = express.Router();
const paymentController = require("./payment.controller");
const authenticateToken = require("../../middlewares/auth.middleware");

// Ödəniş linki yaratmaq
router.post("/create-checkout-session", authenticateToken, paymentController.createCheckoutSession);

// Payriff Webhook (called by Payriff, no user auth middleware)
router.post("/webhook", paymentController.handleWebhook);

module.exports = router;
