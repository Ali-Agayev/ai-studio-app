const axios = require("axios");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const PAYRIFF_SECRET_KEY = process.env.PAYRIFF_SECRET_KEY;
const PAYRIFF_MERCHANT_ID = process.env.PAYRIFF_MERCHANT_ID;

const createCheckoutSession = async (req, res) => {
    const userId = req.user.id;
    const { amount } = req.body; // Kredit miqdarı: 100, 500 və ya 1000

    // Qiymət Paketləri (Kreditlər -> USD)
    const priceMap = {
        100: 0.99,
        500: 3.99,
        1000: 6.99
    };

    const price = priceMap[amount];

    if (!price) {
        return res.status(400).json({ error: "Invalid credit amount package" });
    }

    if (!PAYRIFF_SECRET_KEY || !PAYRIFF_MERCHANT_ID) {
        return res.status(500).json({ error: "Payriff is not configured" });
    }

    try {
        const payload = {
            body: {
                amount: price,
                currency: "USD",
                description: `${amount / 10} Images Pack`,
                language: "EN",
                approveUrl: `https://ai-studio-app-tau.vercel.app/?success=true`,
                cancelUrl: `https://ai-studio-app-tau.vercel.app/?canceled=true`,
                declineUrl: `https://ai-studio-app-tau.vercel.app/?canceled=true`
            },
            merchantId: PAYRIFF_MERCHANT_ID
        };

        const response = await axios.post('https://api.payriff.com/api/v2/createOrder', payload, {
            headers: {
                'Authorization': PAYRIFF_SECRET_KEY,
                'Content-Type': 'application/json'
            }
        });

        if (response.data && response.data.payload && response.data.payload.paymentUrl) {
            res.json({ url: response.data.payload.paymentUrl });
        } else {
            console.error("Payriff Error:", response.data);
            res.status(500).json({ error: "Could not initiate Payriff payment" });
        }
    } catch (error) {
        console.error("Payriff request failed:", error.response?.data || error.message);
        res.status(500).json({ error: "An error occurred while communicating with Payriff" });
    }
};

// Bu funksiya sadəcə demo üçün qalır
const confirmPayment = async (req, res) => {
    res.json({ message: "Secure payment validation should be done via webhook/callback" });
};

module.exports = { createCheckoutSession, confirmPayment };
