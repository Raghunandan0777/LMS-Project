const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    thumbnail: { type: String, default: "" },
    price: { type: Number, default: 0 },
    duration: { type: String, default: "" }, // e.g., "12 weeks"
    instructor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    category: { type: String, default: "General" },
    level: { type: String, enum: ["Beginner", "Intermediate", "Advanced"], default: "Beginner" },
    isPublished: { type: Boolean, default: false },
    modules: [{ type: mongoose.Schema.Types.ObjectId, ref: "Module" }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Course", courseSchema);
