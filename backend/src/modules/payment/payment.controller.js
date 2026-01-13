const Stripe = require('stripe');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const stripe = process.env.STRIPE_SECRET_KEY ? Stripe(process.env.STRIPE_SECRET_KEY) : null;

// Create a Stripe Checkout session. Expect body: { amountCents, credits }
// `amountCents` - total price in cents (integer)
// `credits` - how many credits to add to user on success
const createCheckoutSession = async (req, res) => {
    try {
        if (!stripe) return res.status(500).json({ error: 'Stripe not configured' });
        const userId = req.user?.id;
        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        const { amountCents, credits } = req.body;
        if (!amountCents || isNaN(parseInt(amountCents))) return res.status(400).json({ error: 'Invalid amountCents' });
        const creditsInt = credits ? parseInt(credits) : 0;

        const successUrl = process.env.STRIPE_SUCCESS_URL || (process.env.FRONTEND_URL ? `${process.env.FRONTEND_URL}?success=true` : '/?success=true');
        const cancelUrl = process.env.STRIPE_CANCEL_URL || (process.env.FRONTEND_URL ? `${process.env.FRONTEND_URL}?canceled=true` : '/?canceled=true');

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'payment',
            line_items: [
                {
                    price_data: {
                        currency: process.env.CURRENCY || 'usd',
                        product_data: { name: 'AI Credits' },
                        unit_amount: parseInt(amountCents),
                    },
                    quantity: 1,
                }
            ],
            success_url: successUrl,
            cancel_url: cancelUrl,
            metadata: { userId: String(userId), credits: String(creditsInt) }
        });

        // Create pending transaction mapped to session.id
        await prisma.transaction.create({
            data: {
                userId,
                type: 'PURCHASE',
                amount: creditsInt,
                status: 'PENDING',
                externalId: session.id,
            }
        });

        return res.json({ url: session.url, sessionId: session.id });
    } catch (error) {
        console.error('createCheckoutSession error:', error);
        return res.status(500).json({ error: 'Failed to create checkout session' });
    }
};

// Stripe webhook handler. Expects express.raw body.
const handleWebhook = async (req, res) => {
    try {
        if (!stripe) return res.status(500).json({ error: 'Stripe not configured' });
        const sig = req.headers['stripe-signature'];
        const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
        let event;

        try {
            event = webhookSecret
                ? stripe.webhooks.constructEvent(req.body, sig, webhookSecret)
                : JSON.parse(req.body.toString());
        } catch (err) {
            console.error('Webhook signature verification failed.', err.message);
            return res.status(400).send(`Webhook Error: ${err.message}`);
        }

        if (event.type === 'checkout.session.completed') {
            const session = event.data.object;
            const sessionId = session.id;

            // Try to find transaction by externalId
            const tx = await prisma.transaction.findUnique({ where: { externalId: sessionId } });
            if (!tx) {
                console.warn('Transaction not found for session', sessionId);
                return res.status(200).json({ ok: true });
            }

            if (tx.status === 'COMPLETED') return res.status(200).json({ ok: true });

            // Use metadata credits if available
            const credits = tx.amount || (session.metadata && parseInt(session.metadata.credits)) || 0;

            await prisma.$transaction([
                prisma.transaction.update({ where: { id: tx.id }, data: { status: 'COMPLETED' } }),
                prisma.user.update({ where: { id: tx.userId }, data: { balance: { increment: credits } } })
            ]);

            console.log(`Stripe session ${sessionId} completed, credited user ${tx.userId} with ${credits}`);
        }

        return res.status(200).json({ received: true });
    } catch (error) {
        console.error('handleWebhook error:', error);
        return res.status(500).json({ error: 'Webhook processing failed' });
    }
};

module.exports = { createCheckoutSession, handleWebhook };
