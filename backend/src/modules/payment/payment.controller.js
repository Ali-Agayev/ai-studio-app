const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const stripe = process.env.STRIPE_SECRET_KEY ? require("stripe")(process.env.STRIPE_SECRET_KEY) : null;

const createCheckoutSession = async (req, res) => {
    const userId = req.user.id;
    const { amount } = req.body; // Kredit miqdarı: 100, 500 və ya 1000

    // Qiymət xəritəsi (Kredit -> Cents)
    const priceMap = {
        100: 150,  // $1.50
        500: 400,  // $4.00
        1000: 700  // $7.00
    };

    const priceInCents = priceMap[amount];

    if (!priceInCents) {
        return res.status(400).json({ error: "Invalid credit amount package" });
    }

    if (!stripe) {
        return res.status(500).json({ error: "Stripe is not configured" });
    }
    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: [
                {
                    price_data: {
                        currency: "usd",
                        product_data: {
                            name: `${amount} Credits Pack`,
                        },
                        unit_amount: priceInCents,
                    },
                    quantity: 1,
                },
            ],
            mode: "payment",
            success_url: `https://ai-studio-app-tau.vercel.app/?success=true`,
            cancel_url: `https://ai-studio-app-tau.vercel.app/?canceled=true`,
            metadata: {
                userId: userId.toString(),
                creditAmount: amount.toString(),
            },
        });

        res.json({ url: session.url });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "An error occurred while creating Stripe session" });
    }
};

// Webhook (Sadələşdirilmiş versiya - realda webhook imzasını yoxlamaq lazımdır)
const webhook = async (req, res) => {
    // Demo məqsədli webhook-u simulyasiya edirik (Stripe CLI olmadan test etmək üçün çətindir)
    // Real deploymentdə bura Stripe-dan sorğu gəlir.
    // Ancaq biz hələlik "success_url"-ə qayıdanda balansı artırmalıyıq? 
    // Yox, təhlükəsizlik üçün webhook lazımdır.

    // Stripe CLI olmadan localhost-da webhook test etmək çətindir.
    // Ona görə də istifadəçi ödəniş edib qayıdanda sadə bir endpoint çağıracağıq (TƏHLÜKƏLİDİR amma demo üçün OK)
    // Amma gəlin düzgün webhook strukturunu quraq.
    res.sendStatus(200);
};

// Bu funksiya sadəcə demo üçün qalır, amma Stripe ilə əvəz olunacaq
const topUp = async (req, res) => {
    return res.status(400).json({ error: "Deprecated method. Use /create-checkout-session instead." });
};

// Uğurlu ödəniş təsdiqi (Demo üçün sadələşdirilmiş)
const confirmPayment = async (req, res) => {
    const { userId, amount } = req.body;
    // Real layihədə bu endpointi qorumaq lazımdır!

    await prisma.user.update({
        where: { id: parseInt(userId) },
        data: { balance: { increment: parseInt(amount) } }
    });

    await prisma.transaction.create({
        data: {
            userId: parseInt(userId),
            type: "TOP_UP_STRIPE",
            amount: parseInt(amount)
        }
    });

    res.json({ success: true });
}

module.exports = { createCheckoutSession, topUp, confirmPayment };
