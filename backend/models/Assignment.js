const mongoose = require("mongoose");

// Submission sub-document
const submissionSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    fileUrl: { type: String, required: true },
    fileName: { type: String },
    submittedAt: { type: Date, default: Date.now },
    grade: { type: Number, default: null },
    feedback: { type: String, default: "" },
    status: { type: String, enum: ["submitted", "graded", "late"], default: "submitted" },
  },
  { timestamps: true }
);

const assignmentSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    batch: { type: mongoose.Schema.Types.ObjectId, ref: "Batch", required: true },
    instructor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    deadline: { type: Date, required: true },
    totalMarks: { type: Number, default: 100 },
    instructionFile: { type: String, default: "" }, // URL
    submissions: [submissionSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Assignment", assignmentSchema);
