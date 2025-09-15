const Question = require("../models/Question");
const Result = require("../models/Result");

// Fetch questions by quizId
exports.getQuizQuestions = async (req, res) => {
  try {
    const questions = await Question.find({ quizId: req.params.quizId }).select("-correctAnswer");
    res.json(questions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Submit quiz answers
exports.submitQuiz = async (req, res) => {
  try {
    const { answers, quizId } = req.body;
    const userId = req.user.id;
    const questions = await Question.find({ quizId });

    let score = 0;
    questions.forEach((q, index) => {
      if (q.correctAnswer === answers[index]) score++;
    });

    const pass = score >= Math.ceil(questions.length / 2);

    const result = await Result.create({ userId, quizId, score, pass });
    res.json({ success: true, score, pass, resultId: result._id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
