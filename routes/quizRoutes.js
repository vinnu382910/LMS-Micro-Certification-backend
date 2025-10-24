const express = require("express");
const router = express.Router();
const {
  getQuizInfo,
  getQuizQuestions,
  submitQuiz,
  getAllQuizzes,
  startExam
} = require("../controllers/quizController");
const { verifyToken } = require("../middleware/authMiddleware");

// ✅ Get all quizzes list (for dashboard or quiz list page)
router.get("/list",  getAllQuizzes);

// ✅ Get basic quiz info (before starting exam)
router.get("/info/:quizId", verifyToken, getQuizInfo);

// ✅ Start exam session (creates sessionId)
router.post("/start/:quizId", verifyToken, startExam);

// ✅ Get quiz questions (requires active session)
router.get("/:quizId", verifyToken, getQuizQuestions);

// ✅ Submit quiz answers
router.post("/submit", verifyToken, submitQuiz);

module.exports = router;
