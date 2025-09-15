const express = require("express");
const router = express.Router();
const { getQuizQuestions, submitQuiz } = require("../controllers/quizController");
const { verifyToken } = require("../middleware/authMiddleware");

router.get("/:quizId", verifyToken, getQuizQuestions);
router.post("/submit", verifyToken, submitQuiz);

module.exports = router;
