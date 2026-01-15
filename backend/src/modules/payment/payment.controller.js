const { Paddle, Environment } = require('@paddle/paddle-node-sdk');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Initialize Paddle SDK
const paddle = new Paddle(process.env.PADDLE_API_KEY, {
    environment: process.env.NODE_ENV === 'production' ? Environment.production : Environment.sandbox,
});

// Since Paddle Checkout is client-side, we primarily need the backend to handle webhooks
// to fulfill orders. We can also provide a config endpoint if we want to sign requests server-side,
// but for this implementation, we will rely on the webhook.

// Webhook handler for Paddle
const handleWebhook = async (req, res) => {
    const signature = req.headers['paddle-signature'];
    const secretKey = process.env.PADDLE_WEBHOOK_SECRET_KEY;

    if (!signature || !secretKey) {
        return res.status(403).json({ error: 'Missing signature or secret key' });
    }

    try {
        // Parse the event using the SDK to verify the signature
        const eventData = paddle.webhooks.unmarshal(req.body, secretKey, signature);

        switch (eventData.eventType) {
            case 'transaction.completed':
                await handleTransactionCompleted(eventData.data);
                break;
            default:
                console.log(`Unhandled event type: ${eventData.eventType}`);
        }

        return res.status(200).json({ ok: true });
    } catch (error) {
        console.error('Webhook processing error:', error);
        return res.status(400).json({ error: 'Webhook verification failed' });
    }
};

const handleTransactionCompleted = async (transaction) => {
    // Determine userId from customData
    const userId = transaction.customData?.userId;
    if (!userId) {
        console.error('UserId not found in transaction customData', transaction.id);
        return;
    }

    // Determine credits from customData or by mapping productId/priceId
    // Ideally pass `credits` in customData from frontend
    let credits = transaction.customData?.credits ? parseInt(transaction.customData.credits) : 0;

    // Fallback: simple logic if credits not passed directly (optional, depends on frontend implementation)
    // if (!credits) { ... logic to map priceId to credits ... }

    // Check if transaction already processed (idempotency)
    const existingTx = await prisma.transaction.findUnique({
        where: { externalId: transaction.id }
    });

    if (existingTx && existingTx.status === 'COMPLETED') {
        console.log(`Transaction ${transaction.id} already processed.`);
        return;
    }

    // Update user balance
    // If we haven't created a transaction record yet (e.g. from a prior intent), create it now.
    // Or update existing if we did create one.

    // Note: With Paddle Overlay, we might not have a pre-created pending transaction in DB
    // unlike the previous Stripe session flow. So we likely create it here.

    if (existingTx) {
        await prisma.transaction.update({
            where: { id: existingTx.id },
            data: { status: 'COMPLETED' }
        });
    } else {
        await prisma.transaction.create({
            data: {
                userId: userId,
                type: 'PURCHASE',
                amount: credits,
                status: 'COMPLETED',
                externalId: transaction.id
            }
        });
    }

    await prisma.user.update({
        where: { id: userId },
        data: { balance: { increment: credits } }
    });

    console.log(`Paddle transaction ${transaction.id} completed. Added ${credits} credits to user ${userId}.`);
};

module.exports = { handleWebhook };
