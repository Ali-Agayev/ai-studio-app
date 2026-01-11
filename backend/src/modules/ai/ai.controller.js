const aiService = require("./ai.service");
const { PrismaClient } = require("@prisma/client");
const fs = require('fs');
const prisma = new PrismaClient();

const IMAGE_COST = 10; // 10 credits per image

const generateImage = async (req, res) => {
    try {
        const { prompt } = req.body;
        const userId = req.user.id; // Auth middleware-dən gəlir

        if (!prompt) {
            return res.status(400).json({ error: "Prompt is required" });
        }

        // Balansı yoxla
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (user.balance < IMAGE_COST) {
            return res.status(403).json({ error: "Insufficient balance" });
        }

        // Şəkli yarat
        const imageUrl = await aiService.generateImage(prompt);

        // Balansdan çıx və tranzaksiya yaz
        await prisma.$transaction([
            prisma.user.update({
                where: { id: userId },
                data: { balance: { decrement: IMAGE_COST } },
            }),
            prisma.transaction.create({
                data: {
                    userId,
                    type: "IMAGE_GENERATION",
                    amount: -IMAGE_COST,
                },
            }),
        ]);

        res.json({ imageUrl, cost: IMAGE_COST, remainingBalance: user.balance - IMAGE_COST });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const editImage = async (req, res) => {
    try {
        const { prompt } = req.body;
        const userId = req.user.id;
        const file = req.file;

        if (!file) return res.status(400).json({ error: "Image file is required" });
        if (!prompt) {
            fs.unlinkSync(file.path);
            return res.status(400).json({ error: "Prompt is required" });
        }

        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (user.balance < IMAGE_COST) {
            fs.unlinkSync(file.path);
            return res.status(403).json({ error: "Insufficient balance" });
        }

        const imageUrl = await aiService.editImage(file.path, prompt);

        // Şəkli silirik (temp)
        fs.unlinkSync(file.path);

        await prisma.$transaction([
            prisma.user.update({
                where: { id: userId },
                data: { balance: { decrement: IMAGE_COST } },
            }),
            prisma.transaction.create({
                data: { userId, type: "IMAGE_EDIT", amount: -IMAGE_COST },
            }),
        ]);

        res.json({ imageUrl, cost: IMAGE_COST, remainingBalance: user.balance - IMAGE_COST });
    } catch (error) {
        if (req.file) fs.unlinkSync(req.file.path);
        res.status(500).json({ error: error.message });
    }
};

const createVariation = async (req, res) => {
    try {
        const userId = req.user.id;
        const file = req.file;

        if (!file) return res.status(400).json({ error: "Image file is required" });

        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (user.balance < IMAGE_COST) {
            fs.unlinkSync(file.path);
            return res.status(403).json({ error: "Insufficient balance" });
        }

        const imageUrl = await aiService.createVariation(file.path);

        fs.unlinkSync(file.path);

        await prisma.$transaction([
            prisma.user.update({
                where: { id: userId },
                data: { balance: { decrement: IMAGE_COST } },
            }),
            prisma.transaction.create({
                data: { userId, type: "IMAGE_VARIATION", amount: -IMAGE_COST },
            }),
        ]);

        res.json({ imageUrl, cost: IMAGE_COST, remainingBalance: user.balance - IMAGE_COST });
    } catch (error) {
        if (req.file) fs.unlinkSync(req.file.path);
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    generateImage,
    editImage,
    createVariation
};
