const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const getUsers = async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                email: true,
                balance: true,
                role: true,
                createdAt: true,
            },
            orderBy: { createdAt: "desc" },
        });
        res.json(users);
    } catch (error) {
        console.error("Admin: getUsers error:", error);
        res.status(500).json({ error: "Failed to fetch users" });
    }
};

const getStats = async (req, res) => {
    try {
        const totalUsers = await prisma.user.count();
        const totalBalance = await prisma.user.aggregate({
            _sum: { balance: true },
        });
        const totalTransactions = await prisma.transaction.count({
            where: { status: 'COMPLETED' }
        });

        res.json({
            totalUsers,
            totalCredits: totalBalance._sum.balance || 0,
            totalSales: totalTransactions
        });
    } catch (error) {
        console.error("Admin: getStats error:", error);
        res.status(500).json({ error: "Failed to fetch stats" });
    }
};

module.exports = { getUsers, getStats };
