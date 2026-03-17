const mongoose = require("mongoose");

// ─── Lesson ────────────────────────────────────────────────
const lessonSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    type: { type: String, enum: ["video", "pdf", "text"], required: true },
    content: { type: String, default: "" }, // text content or file URL
    duration: { type: Number, default: 0 }, // minutes
    order: { type: Number, default: 0 },
    module: { type: mongoose.Schema.Types.ObjectId, ref: "Module", required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
    isPreview: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// ─── Module / Chapter ──────────────────────────────────────
const moduleSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, default: "" },
    order: { type: Number, default: 0 },
    course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
    lessons: [{ type: mongoose.Schema.Types.ObjectId, ref: "Lesson" }],
  },
  { timestamps: true }
);

const Lesson = mongoose.model("Lesson", lessonSchema);
const Module = mongoose.model("Module", moduleSchema);

module.exports = { Lesson, Module };
