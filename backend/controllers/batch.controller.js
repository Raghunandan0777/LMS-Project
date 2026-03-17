const Batch = require("../models/Batch");
const User = require("../models/User");
const Progress = require("../models/Progress");

// @GET /api/batches  (list available batches for students)
exports.getBatches = async (req, res) => {
  try {
    const batches = await Batch.find({ isActive: true })
      .populate("course", "title thumbnail price")
      .populate("instructor", "name avatar")
      .sort("-createdAt");
    res.json({ success: true, batches });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @GET /api/batches/my  (instructor's batches)
exports.getMyBatches = async (req, res) => {
  try {
    const batches = await Batch.find({ instructor: req.user._id })
      .populate("course", "title thumbnail")
      .populate("enrolledStudents", "name email avatar")
      .sort("-createdAt");
    res.json({ success: true, batches });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @GET /api/batches/:id
exports.getBatchById = async (req, res) => {
  try {
    const batch = await Batch.findById(req.params.id)
      .populate("course", "title description thumbnail modules")
      .populate("instructor", "name avatar bio")
      .populate("enrolledStudents", "name email avatar");
    if (!batch) return res.status(404).json({ success: false, message: "Batch not found" });
    res.json({ success: true, batch });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @POST /api/batches  (instructor creates batch)
exports.createBatch = async (req, res) => {
  try {
    const { name, courseId, startDate, endDate, capacity } = req.body;
    const batch = await Batch.create({
      name, course: courseId, instructor: req.user._id,
      startDate, endDate, capacity,
    });
    res.status(201).json({ success: true, batch });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @PUT /api/batches/:id
exports.updateBatch = async (req, res) => {
  try {
    const batch = await Batch.findById(req.params.id);
    if (!batch) return res.status(404).json({ success: false, message: "Batch not found" });
    if (batch.instructor.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }
    const updated = await Batch.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, batch: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @POST /api/batches/:id/enroll  (student enrolls)
exports.enrollInBatch = async (req, res) => {
  try {
    const batch = await Batch.findById(req.params.id);
    if (!batch) return res.status(404).json({ success: false, message: "Batch not found" });
    if (!batch.isActive) return res.status(400).json({ success: false, message: "Batch is not active" });
    if (batch.enrolledStudents.length >= batch.capacity) {
      return res.status(400).json({ success: false, message: "Batch is full" });
    }
    if (batch.enrolledStudents.includes(req.user._id)) {
      return res.status(400).json({ success: false, message: "Already enrolled" });
    }

    batch.enrolledStudents.push(req.user._id);
    await batch.save();

    await User.findByIdAndUpdate(req.user._id, { $addToSet: { enrolledBatches: batch._id } });

    // Create progress record
    await Progress.findOneAndUpdate(
      { student: req.user._id, course: batch.course },
      { student: req.user._id, course: batch.course, batch: batch._id },
      { upsert: true, new: true }
    );

    res.json({ success: true, message: "Enrolled successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @DELETE /api/batches/:id/unenroll
exports.unenrollFromBatch = async (req, res) => {
  try {
    const batch = await Batch.findById(req.params.id);
    if (!batch) return res.status(404).json({ success: false, message: "Batch not found" });
    batch.enrolledStudents = batch.enrolledStudents.filter(
      (s) => s.toString() !== req.user._id.toString()
    );
    await batch.save();
    await User.findByIdAndUpdate(req.user._id, { $pull: { enrolledBatches: batch._id } });
    res.json({ success: true, message: "Unenrolled successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
