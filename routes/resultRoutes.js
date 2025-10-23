const express = require("express");
const router = express.Router();
const { getUserResults } = require("../controllers/resultController");
const { verifyToken } = require("../middleware/authMiddleware");
// Protected route - only logged-in user
// router.get("/results", verifyToken, getUserResults);
router.get("/passed-results", verifyToken, getUserResults);

module.exports = router;
