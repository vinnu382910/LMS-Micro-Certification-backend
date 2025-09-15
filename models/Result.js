const mongoose = require("mongoose");

const resultSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  quizId: { type: String, required: true },
  score: { type: Number, required: true },
  pass: { type: Boolean, required: true },
  date: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Result", resultSchema);
