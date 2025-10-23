const QuestionSet = require("../models/Question");
const Result = require("../models/Result");
const User = require("../models/User"); 
const ExamSession = require("../models/ExamSession");
const { v4: uuidv4 } = require("uuid"); // for unique session IDs

// GET /quiz/list?level=Easy&type=Python&search=python
exports.getAllQuizzes = async (req, res) => {

  try {
    const { level, tech, search } = req.query;

    // 🧠 Build dynamic MongoDB filter
    const filter = {};

    // Filter by Level (case-insensitive)
    if (level && ["easy", "medium", "hard"].includes(level.toLowerCase())) {
      filter.level = new RegExp(`^${level}$`, "i");
    }

    // Filter by Technology (partial match inside array)
    if (tech && tech.trim() !== "") {
      filter.technologies = { $regex: new RegExp(tech, "i") };
    }

    // Keyword search (title or description)
    if (search && search.trim() !== "") {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    // Fetch quizzes
    const quizzes = await QuestionSet.find(filter, {
      quizId: 1,
      title: 1,
      description: 1,
      level: 1,
      timeLimit: 1,
      passMarks: 1,
      technologies: 1,
      totalQuestions: 1,
      _id: 0,
    }).sort({ title: 1 });

    // ✅ Return success even if no quizzes found
    if (!quizzes || quizzes.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No Quizzes Found",
        quizzes: [],
      });
    }

    return res.status(200).json({ success: true, quizzes });
  } catch (error) {
    console.error("❌ Error fetching quiz list:", error.message);
    return res
      .status(500)
      .json({ success: false, message: "Server error. Please try again later." });
  }
};



// Fetch questions by quizId
// Controller: getQuizQuestions
exports.getQuizQuestions = async (req, res) => {
  try {
    const { quizId } = req.params;
    const examSessionId =
      req.headers["x-exam-session"] || req.query.sessionId; // ✅ check both

    if (!examSessionId) {
      return res.status(403).json({ message: "No active exam session found" });
    }

    const session = await ExamSession.findOne({ quizId, examSessionId, isSubmitted: false });
    if (!session) {
      return res.status(403).json({ message: "Invalid or expired session" });
    }

    const quiz = await QuestionSet.findOne({ quizId });
    if (!quiz) return res.status(404).json({ message: "Quiz not found" });

    const quizDetails = {
      title: quiz.title,
      description: quiz.description,
      level: quiz.level,
      timeLimit: quiz.timeLimit,
      totalQuestions: quiz.totalQuestions,
      passingMarks: quiz.passMarks,
    };

    const questions = quiz.questions.map((q) => ({
      questionText: q.questionText,
      options: q.options,
    }));

    res.status(200).json({ quiz: quizDetails, questions });
  } catch (err) {
    console.error("Error fetching quiz questions:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};




// Submit quiz answers

// POST /quiz/submit - Submit quiz answers
exports.submitQuiz = async (req, res) => {
  try {
    const { answers, quizId, examSessionId } = req.body;
    const userId = req.user.id;

    const session = await ExamSession.findOne({ userId, quizId, examSessionId });
    if (!session || session.isSubmitted) {
      return res.status(403).json({ message: "Invalid or expired exam session" });
    }

    // Fetch quiz set
    const questionSet = await QuestionSet.findOne({ quizId });
    if (!questionSet) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    const user = await User.findById(userId);
    const userName = user ? user.name : "Unknown";

    let score = 0;
    const detailedResults = [];
    let correctCount = 0;
    let wrongCount = 0;

    questionSet.questions.forEach((question, index) => {
      const userAnswer = answers[index] || null;
      const isCorrect = question.correctAnswer === userAnswer;

      if (isCorrect) score++, correctCount++;
      else wrongCount++;

      detailedResults.push({
        questionText: question.questionText,
        options: question.options,
        correctAnswer: question.correctAnswer,
        userAnswer,
        isCorrect,
      });
    });

    const pass = score >= questionSet.passMarks;

    // Save result
    const result = await Result.create({
      userId,
      userName,
      quizId,
      quizTitle: questionSet.title,
      level: questionSet.level,
      score,
      pass,
      correctCount,
      wrongCount,
      totalQuestions: questionSet.questions.length,
      technologies: questionSet.technologies
    });

    // Mark session as submitted
    session.isSubmitted = true;
    await session.save();

    res.status(200).json({
      success: true,
      score,
      pass,
      resultId: result._id,
      totalQuestions: questionSet.questions.length,
      correctCount,
      wrongCount,
      detailedResults,
      technologies: questionSet.technologies
    });
  } catch (error) {
    console.error("Error submitting quiz:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};




// POST /quiz/start/:quizId
exports.startExam = async (req, res) => {
  try {
    const { quizId } = req.params;
    const userId = req.user.id;

    const quiz = await QuestionSet.findOne({ quizId });
    if (!quiz) {
      return res.status(404).json({ success: false, message: "Quiz not found" });
    }

    // check if already active session exists
    const existingSession = await ExamSession.findOne({ userId, quizId, isSubmitted: false });
    if (existingSession) {
      return res.status(200).json({
        success: true,
        message: "Existing active session found",
        examSessionId: existingSession.examSessionId,
      });
    }

    // Create new exam session
    const examSessionId = uuidv4();
    const expiresAt = new Date(Date.now() + quiz.timeLimit * 60 * 1000); // timeLimit in minutes

    await ExamSession.create({
      userId,
      quizId,
      examSessionId,
      expiresAt,
    });

    res.status(201).json({
      success: true,
      message: "Exam started successfully",
      examSessionId,
      expiresAt,
    });
  } catch (error) {
    console.error("Error starting exam:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


// GET /quiz/info/:quizId - basic quiz info (no questions)
exports.getQuizInfo = async (req, res) => {
  try {
    const quizId = req.params.quizId;
    const questionSet = await QuestionSet.findOne({ quizId })
      .select("title description level timeLimit totalQuestions passMarks");

    if (!questionSet) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    res.status(200).json({
      success: true,
      quiz: questionSet,
    });
  } catch (err) {
    console.error("Error fetching quiz info:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};
