const axios = require("axios");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Payment initialization placeholder
const createCheckoutSession = async (req, res) => {
    res.status(501).json({ error: "Payment system is being updated. Please check back later." });
};

// Webhook placeholder
const handleWebhook = async (req, res) => {
    res.status(501).json({ error: "Webhook not configured." });
};

module.exports = { createCheckoutSession, handleWebhook };
