const axios = require("axios");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const PAYRIFF_SECRET_KEY = process.env.PAYRIFF_SECRET_KEY;
const PAYRIFF_MERCHANT_ID = process.env.PAYRIFF_MERCHANT_ID;

const createCheckoutSession = async (req, res) => {
    const userId = req.user.id;
    const { amount } = req.body; // Credit amount: 100, 500 or 1000

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
        // 1. Create a PENDING transaction in our DB first
        const transaction = await prisma.transaction.create({
            data: {
                userId: userId,
                type: "PURCHASE",
                amount: amount,
                status: "PENDING"
            }
        });

        const payload = {
            body: {
                amount: price,
                currency: "USD",
                description: `${amount / 10} Images Pack`,
                language: "EN",
                approveUrl: `${process.env.FRONTEND_URL || 'https://ai-studio-app-tau.vercel.app'}/?success=true`,
                cancelUrl: `${process.env.FRONTEND_URL || 'https://ai-studio-app-tau.vercel.app'}/?canceled=true`,
                declineUrl: `${process.env.FRONTEND_URL || 'https://ai-studio-app-tau.vercel.app'}/?canceled=true`
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
            // Update transaction with internal ID (Order ID) from Payriff
            await prisma.transaction.update({
                where: { id: transaction.id },
                data: { externalId: response.data.payload.orderId }
            });

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

const handleWebhook = async (req, res) => {
    const { payload, signature } = req.body;
    // In production, you should verify the signature here using PAYRIFF_SECRET_KEY

    try {
        const { orderId, orderStatus } = payload;

        if (orderStatus === "APPROVED") {
            // 1. Find the transaction
            const transaction = await prisma.transaction.findUnique({
                where: { externalId: orderId.toString() },
                include: { user: true }
            });

            if (transaction && transaction.status === "PENDING") {
                // 2. Update user balance and transaction status in a transaction
                await prisma.$transaction([
                    prisma.user.update({
                        where: { id: transaction.userId },
                        data: { balance: { increment: transaction.amount } }
                    }),
                    prisma.transaction.update({
                        where: { id: transaction.id },
                        data: { status: "COMPLETED" }
                    })
                ]);
            }
        } else if (orderStatus === "CANCELED" || orderStatus === "DECLINED") {
            await prisma.transaction.updateMany({
                where: { externalId: orderId.toString() },
                data: { status: "FAILED" }
            });
        }

        res.json({ status: "ACK" });
    } catch (error) {
        console.error("Webhook processing error:", error);
        res.status(500).json({ error: "Webhook failed" });
    }
};

module.exports = { createCheckoutSession, handleWebhook };
