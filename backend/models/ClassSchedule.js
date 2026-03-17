const mongoose = require("mongoose");

const classScheduleSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    batch: { type: mongoose.Schema.Types.ObjectId, ref: "Batch", required: true },
    instructor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    date: { type: Date, required: true },
    duration: { type: Number, default: 60 }, // minutes
    meetingLink: { type: String, required: true },
    description: { type: String, default: "" },
    status: { type: String, enum: ["scheduled", "completed", "cancelled"], default: "scheduled" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ClassSchedule", classScheduleSchema);
