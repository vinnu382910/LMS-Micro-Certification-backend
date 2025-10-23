const mongoose = require("mongoose");

const resultSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  userName: { type: String, required: true },           // new field
  quizId: { type: String, required: true },
  quizTitle: { type: String, required: true },         // new field
  level: { type: String, required: true },             // new field (Easy/Medium/Hard)
  score: { type: Number, required: true },
  pass: { type: Boolean, required: true },
  technologies: [
      {
        type: String,
        trim: true,
        required: true,
      },
    ],
  correctCount: { type: Number, required: true },      // new field
  wrongCount: { type: Number, required: true },        // new field
  totalQuestions: { type: Number, required: true },    // new field
  date: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Result", resultSchema);
