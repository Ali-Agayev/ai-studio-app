const express = require("express");
const router = express.Router();
const aiController = require("./ai.controller");
const { authenticateToken } = require("../../middlewares/auth.middleware");
const multer = require("multer");
const path = require("path");

const upload = multer({
    dest: path.join(__dirname, "../../../uploads"),
    limits: { fileSize: 4 * 1024 * 1024 }, // 4MB limit (OpenAI requirement)
});

// Public route for testing connection (təhlükəsizlik üçün istehsalatda söndürülə bilər, amma debug üçün lazımdır)
router.get("/test", aiController.testConnection);

router.post("/generate", authenticateToken, aiController.generateImage);
router.post("/edit", authenticateToken, upload.single("image"), aiController.editImage);
router.post("/variation", authenticateToken, upload.single("image"), aiController.createVariation);

module.exports = router;
