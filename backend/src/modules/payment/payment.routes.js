const express = require("express");
const router = express.Router();
const paymentController = require("./payment.controller");
// const { authenticateToken } = require("../../middlewares/auth.middleware");

// Webhook for payment confirmation
// Note: Middleware for raw body is handled in app.js or we can rely on body-parser here if needed,
// but usually app.js `express.json()` interferes. 
// However, sdk unmarshal usually takes string or buffer.
// We will ensure the route in app.js passes the right body or handle it here.
router.post("/webhook", paymentController.handleWebhook);

module.exports = router;
