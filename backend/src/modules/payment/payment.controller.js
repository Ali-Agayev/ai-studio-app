const axios = require("axios");
const crypto = require("crypto");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Create a checkout session: create a pending Transaction and return a Payoneer redirect URL.
const createCheckoutSession = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) return res.status(401).json({ error: "Unauthorized" });

        const { amount } = req.body; // amount in credits (integer)
        if (!amount || isNaN(parseInt(amount))) return res.status(400).json({ error: "Invalid amount" });

        // Generate a unique token to map Payoneer callback to this transaction
        const token = crypto.randomBytes(16).toString("hex");

        // Create pending transaction record
        const tx = await prisma.transaction.create({
            data: {
                userId,
                type: "PURCHASE",
                amount: parseInt(amount),
                status: "PENDING",
                externalId: token,
            }
        });

        // Build Payoneer redirect URL. Prefer server template env var if provided.
        let url = null;
        if (process.env.PAYONEER_CHECKOUT_URL_TEMPLATE) {
            url = process.env.PAYONEER_CHECKOUT_URL_TEMPLATE.replace("{token}", token).replace("{amount}", String(amount));
        } else if (process.env.PAYONEER_BASE_URL) {
            url = `${process.env.PAYONEER_BASE_URL}?t=${token}`;
        } else if (req.body.returnUrl) {
            // Fallback: if server already created full link and sent it in body (not recommended)
            url = req.body.returnUrl;
        } else {
            // If no external provider URL template provided, return token so operator can construct URL.
            return res.json({ token, message: "No Payoneer checkout URL template configured. Save token and construct the checkout URL on your Payoneer dashboard using this token." });
        }

        return res.json({ url, token });
    } catch (error) {
        console.error("createCheckoutSession error:", error);
        res.status(500).json({ error: "Failed to create checkout session" });
    }
};

// Webhook handler: validates signature (if secret present), parses payload,
// finds matching Transaction by token/externalId, and updates status + user balance.
const handleWebhook = async (req, res) => {
    try {
        // If raw body is provided (express.raw), req.body is a Buffer
        let rawBody = req.body;
        if (Buffer.isBuffer(rawBody)) {
            // validate signature if secret available
            const signatureHeader = (req.headers['x-payoneer-signature'] || req.headers['x-signature'] || '').toString();
            if (process.env.PAYONEER_WEBHOOK_SECRET && signatureHeader) {
                const expected = crypto.createHmac('sha256', process.env.PAYONEER_WEBHOOK_SECRET).update(rawBody).digest('hex');
                if (expected !== signatureHeader) {
                    console.warn('Webhook signature mismatch');
                    return res.status(401).json({ error: 'Invalid signature' });
                }
            }

            const payload = JSON.parse(rawBody.toString());

            console.log('Payoneer webhook payload:', payload);

            const token = payload.token || payload.externalId || payload.t;
            const status = (payload.status || payload.event || '').toString().toUpperCase();

            if (!token) return res.status(400).json({ error: 'Missing token in webhook payload' });

            const tx = await prisma.transaction.findUnique({ where: { externalId: token } });
            if (!tx) {
                console.warn('Transaction not found for token', token);
                return res.status(404).json({ error: 'Transaction not found' });
            }

            // Idempotency: if already completed, return ok
            if (tx.status === 'COMPLETED') return res.status(200).json({ ok: true });

            // Treat common success states
            const successStates = ['COMPLETED', 'PAID', 'SUCCESS'];
            if (successStates.includes(status) || payload.paid === true || payload.success === true) {
                await prisma.$transaction([
                    prisma.transaction.update({ where: { id: tx.id }, data: { status: 'COMPLETED' } }),
                    prisma.user.update({ where: { id: tx.userId }, data: { balance: { increment: tx.amount } } })
                ]);

                console.log(`Transaction ${tx.id} completed, credited user ${tx.userId} with ${tx.amount}`);
                return res.status(200).json({ ok: true });
            }

            // If payment failed
            await prisma.transaction.update({ where: { id: tx.id }, data: { status: 'FAILED' } });
            return res.status(200).json({ ok: true });
        } else {
            // If body already parsed (fallback), treat similarly
            const payload = req.body;
            console.log('Webhook payload (parsed):', payload);
            const token = payload.token || payload.externalId || payload.t;
            const status = (payload.status || payload.event || '').toString().toUpperCase();
            if (!token) return res.status(400).json({ error: 'Missing token' });
            const tx = await prisma.transaction.findUnique({ where: { externalId: token } });
            if (!tx) return res.status(404).json({ error: 'Transaction not found' });
            if (tx.status === 'COMPLETED') return res.status(200).json({ ok: true });
            const successStates = ['COMPLETED', 'PAID', 'SUCCESS'];
            if (successStates.includes(status) || payload.paid === true || payload.success === true) {
                await prisma.$transaction([
                    prisma.transaction.update({ where: { id: tx.id }, data: { status: 'COMPLETED' } }),
                    prisma.user.update({ where: { id: tx.userId }, data: { balance: { increment: tx.amount } } })
                ]);
                return res.status(200).json({ ok: true });
            }
            await prisma.transaction.update({ where: { id: tx.id }, data: { status: 'FAILED' } });
            return res.status(200).json({ ok: true });
        }
    } catch (error) {
        console.error('handleWebhook error:', error);
        return res.status(500).json({ error: 'Webhook processing error' });
    }
};

module.exports = { createCheckoutSession, handleWebhook };
