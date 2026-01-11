const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const getProfile = async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            select: { id: true, email: true, balance: true, createdAt: true }
        });
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch user profile" });
    }
};

module.exports = { getProfile };
