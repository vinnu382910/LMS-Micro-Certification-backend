// models/Question.js
const mongoose = require("mongoose");

const QuestionSchema = new mongoose.Schema({
  quizId: { type: String, required: true, unique: true }, // e.g. "pythonEasy"
  title: { type: String, required: true }, // e.g. "Python Basics Quiz"
  description: { type: String }, // optional
  level: { 
    type: String, 
    enum: ["Easy", "Medium", "Hard"], 
    default: "Easy" 
  }, // Difficulty level
  timeLimit: { type: Number, required: true }, // In minutes
  passMarks: { type: Number, required: true }, // Score required to pass
  totalQuestions: { type: Number, required: true }, // Store explicitly
 // ✅ New field: Technologies / Skills
    technologies: [
      {
        type: String,
        trim: true,
        required: true,
      },
    ], // e.g. ["HTML", "CSS", "JavaScript"] or ["Python", "SQL"]

  questions: [
    {
      questionText: { type: String, required: true },
      options: [{ type: String, required: true }],
      correctAnswer: { type: String, required: true },
    }
  ]
});

// Before saving, automatically set totalQuestions
QuestionSchema.pre("save", function (next) {
  this.totalQuestions = this.questions.length;
  next();
});

module.exports = mongoose.model("QuestionSet", QuestionSchema);
