const ClassSchedule = require("../models/ClassSchedule");
const Batch = require("../models/Batch");

// @GET /api/classes/batch/:batchId
exports.getClassesByBatch = async (req, res) => {
  try {
    const classes = await ClassSchedule.find({ batch: req.params.batchId })
      .populate("instructor", "name avatar")
      .sort("date");
    res.json({ success: true, classes });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @GET /api/classes/upcoming  (for enrolled student)
exports.getUpcomingClasses = async (req, res) => {
  try {
    const user = req.user;
    const batches = user.enrolledBatches || [];
    const classes = await ClassSchedule.find({
      batch: { $in: batches },
      date: { $gte: new Date() },
      status: "scheduled",
    })
      .populate("batch", "name")
      .populate("instructor", "name avatar")
      .sort("date")
      .limit(10);
    res.json({ success: true, classes });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @GET /api/classes/instructor  (instructor's scheduled classes)
exports.getInstructorClasses = async (req, res) => {
  try {
    const classes = await ClassSchedule.find({ instructor: req.user._id })
      .populate("batch", "name course")
      .sort("-date");
    res.json({ success: true, classes });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @POST /api/classes
exports.createClass = async (req, res) => {
  try {
    const { title, batchId, date, duration, meetingLink, description } = req.body;
    const batch = await Batch.findById(batchId);
    if (!batch) return res.status(404).json({ success: false, message: "Batch not found" });
    if (batch.instructor.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }
    const classSchedule = await ClassSchedule.create({
      title, batch: batchId, instructor: req.user._id,
      date, duration, meetingLink, description,
    });
    res.status(201).json({ success: true, classSchedule });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @PUT /api/classes/:id
exports.updateClass = async (req, res) => {
  try {
    const classSchedule = await ClassSchedule.findById(req.params.id);
    if (!classSchedule) return res.status(404).json({ success: false, message: "Class not found" });
    if (classSchedule.instructor.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }
    const updated = await ClassSchedule.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, classSchedule: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @DELETE /api/classes/:id
exports.deleteClass = async (req, res) => {
  try {
    const classSchedule = await ClassSchedule.findById(req.params.id);
    if (!classSchedule) return res.status(404).json({ success: false, message: "Class not found" });
    if (classSchedule.instructor.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }
    await ClassSchedule.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Class deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
