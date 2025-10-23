// routes/certificate.js
const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/authMiddleware");
const { generateCertificateByResultId } = require("../controllers/certificateController");

router.post("/download", verifyToken, generateCertificateByResultId);

module.exports = router;
