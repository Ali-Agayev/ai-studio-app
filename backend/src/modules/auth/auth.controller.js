const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const prisma = new PrismaClient();

const register = async (req, res) => {
  const { email, password } = req.body;
  try {
    const hash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, password: hash }
    });
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: "1d" });
    res.json({ message: "Qeydiyyat uğurla tamamlandı ✅", token });
  } catch (err) {
    res.status(400).json({ error: "Email artıq mövcuddur" });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(400).json({ error: "İstifadəçi tapılmadı" });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(400).json({ error: "Şifrə yalnışdır" });

  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: "1d" });
  res.json({ token });
};

module.exports = { register, login };
