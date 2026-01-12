const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const authRoutes = require("./modules/auth/auth.routes");

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// Auth routes
app.use("/auth", authRoutes);

// AI routes
const aiRoutes = require("./modules/ai/ai.routes");
app.use("/ai", aiRoutes);

// User routes
const userRoutes = require("./modules/user/user.routes");
app.use("/user", userRoutes);

// Payment routes
const paymentRoutes = require("./modules/payment/payment.routes");
app.use("/payment", paymentRoutes);

// Admin routes
const adminRoutes = require("./modules/admin/admin.routes");
app.use("/admin", adminRoutes);

app.get("/", (req, res) => {
  res.send("Backend is running ✅");
});

module.exports = app;
