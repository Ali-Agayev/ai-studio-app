const express = require("express");
const router = express.Router();
const paymentController = require("./payment.controller");
const { authenticateToken } = require("../../middlewares/auth.middleware");

// Create payment session
router.post("/create-checkout-session", authenticateToken, paymentController.createCheckoutSession);

// Webhook for payment confirmation
router.post("/webhook", paymentController.handleWebhook);

module.exports = router;
