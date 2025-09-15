const express = require("express");
const router = express.Router();
const { getQuizQuestions, submitQuiz } = require("../controllers/quizController");
const { verifyToken } = require("../middleware/authMiddleware");

router.get("/:quizId", getQuizQuestions);
router.post("/submit", verifyToken, submitQuiz);

module.exports = router;
