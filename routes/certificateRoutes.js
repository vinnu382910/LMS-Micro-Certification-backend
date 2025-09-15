const express = require("express");
const router = express.Router();
const { generateCertificate } = require("../controllers/certificateController");
const { verifyToken } = require("../middleware/authMiddleware");

router.post("/", verifyToken, generateCertificate);

module.exports = router;
