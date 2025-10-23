const mongoose = require("mongoose");

const examSessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  quizId: { type: String, required: true },
  examSessionId: { type: String, required: true, unique: true },
  startedAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true },
  isSubmitted: { type: Boolean, default: false },
});

module.exports = mongoose.model("ExamSession", examSessionSchema);
