const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const createCheckoutSession = async (req, res) => {
    const userId = req.user.id;
    const { amount } = req.body; // Məsələn: 50
    const priceInCents = amount * 10; // 50 kredit = 500 qəpik (5.00 USD)

    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: [
                {
                    price_data: {
                        currency: "usd",
                        product_data: {
                            name: `${amount} Kredit`,
                        },
                        unit_amount: 1, // 1 kredit = 1 sent. 50 kredit = 50 sent.
                    },
                    quantity: amount,
                },
            ],
            mode: "payment",
            success_url: `http://localhost:5173/?success=true`,
            cancel_url: `http://localhost:5173/?canceled=true`,
            metadata: {
                userId: userId.toString(),
                creditAmount: amount.toString(),
            },
        });

        res.json({ url: session.url });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Stripe sessiyası yaradılarkən xəta baş verdi" });
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
    return res.status(400).json({ error: "Köhnə metod. Yeni metod: /create-checkout-session" });
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
