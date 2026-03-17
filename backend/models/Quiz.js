const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: [{ type: String, required: true }], // 4 options
  correctOption: { type: Number, required: true }, // index 0-3
  marks: { type: Number, default: 1 },
});

const attemptSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  answers: [{ questionIndex: Number, selectedOption: Number }],
  score: { type: Number, default: 0 },
  passed: { type: Boolean, default: false },
  attemptedAt: { type: Date, default: Date.now },
});

const quizSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, default: "" },
    batch: { type: mongoose.Schema.Types.ObjectId, ref: "Batch", required: true },
    instructor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    questions: [questionSchema],
    passingMarks: { type: Number, required: true },
    totalMarks: { type: Number, default: 0 },
    duration: { type: Number, default: 30 }, // minutes
    attempts: [attemptSchema],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Auto-calculate total marks
quizSchema.pre("save", function (next) {
  this.totalMarks = this.questions.reduce((sum, q) => sum + q.marks, 0);
  next();
});

module.exports = mongoose.model("Quiz", quizSchema);
