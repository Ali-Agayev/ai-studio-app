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

const deleteUser = async (req, res) => {
    const { id } = req.params;
    try {
        // Delete transactions first
        await prisma.transaction.deleteMany({
            where: { userId: parseInt(id) },
        });

        // Delete user
        await prisma.user.delete({
            where: { id: parseInt(id) },
        });

        res.json({ message: "İstifadəçi uğurla silindi ✅" });
    } catch (error) {
        console.error("Admin: deleteUser error:", error);
        res.status(500).json({ error: "İstifadəçini silmək mümkün olmadı" });
    }
};

const updateUserRole = async (req, res) => {
    const { id } = req.params;
    const { role } = req.body;
    try {
        await prisma.user.update({
            where: { id: parseInt(id) },
            data: { role }
        });
        res.json({ message: `İstifadəçinin rolu ${role} olaraq yeniləndi ✅` });
    } catch (error) {
        console.error("Admin: updateUserRole error:", error);
        res.status(500).json({ error: "Rolu yeniləmək mümkün olmadı" });
    }
};

const giftCredits = async (req, res) => {
    const { id } = req.params;
    const { amount } = req.body;
    try {
        await prisma.user.update({
            where: { id: parseInt(id) },
            data: { balance: { increment: parseInt(amount) } }
        });
        res.json({ message: `${amount} kredit uğurla əlavə edildi ✅` });
    } catch (error) {
        console.error("Admin: giftCredits error:", error);
        res.status(500).json({ error: "Balansı artırmaq mümkün olmadı" });
    }
};

module.exports = { getUsers, getStats, deleteUser, updateUserRole, giftCredits };
