const User = require("../models/User");
const Course = require("../models/Course");
const Batch = require("../models/Batch");

// @GET /api/admin/stats
exports.getDashboardStats = async (req, res) => {
  try {
    const [totalStudents, totalInstructors, totalCourses, totalBatches, pendingInstructors] =
      await Promise.all([
        User.countDocuments({ role: "student" }),
        User.countDocuments({ role: "instructor", isApproved: true }),
        Course.countDocuments(),
        Batch.countDocuments(),
        User.countDocuments({ role: "instructor", isApproved: false }),
      ]);

    // Total enrollments
    const batchesWithEnroll = await Batch.find({}, "enrolledStudents");
    const totalEnrollments = batchesWithEnroll.reduce(
      (sum, b) => sum + b.enrolledStudents.length, 0
    );

    res.json({
      success: true,
      stats: { totalStudents, totalInstructors, totalCourses, totalBatches, totalEnrollments, pendingInstructors },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @GET /api/admin/users
exports.getAllUsers = async (req, res) => {
  try {
    const { role, page = 1, limit = 20 } = req.query;
    const query = role ? { role } : {};
    const users = await User.find(query)
      .select("-password")
      .sort("-createdAt")
      .skip((page - 1) * limit)
      .limit(Number(limit));
    const total = await User.countDocuments(query);
    res.json({ success: true, users, total, page: Number(page) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @GET /api/admin/instructors/pending
exports.getPendingInstructors = async (req, res) => {
  try {
    const instructors = await User.find({ role: "instructor", isApproved: false })
      .select("-password")
      .sort("-createdAt");
    res.json({ success: true, instructors });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @PATCH /api/admin/instructors/:id/approve
exports.approveInstructor = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user || user.role !== "instructor") {
      return res.status(404).json({ success: false, message: "Instructor not found" });
    }
    user.isApproved = true;
    await user.save();
    res.json({ success: true, message: "Instructor approved", user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @PATCH /api/admin/instructors/:id/reject
exports.rejectInstructor = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Instructor rejected and removed" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @DELETE /api/admin/users/:id
exports.deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "User deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @GET /api/admin/enrollments
exports.getEnrollments = async (req, res) => {
  try {
    const batches = await Batch.find()
      .populate("course", "title")
      .populate("instructor", "name email")
      .populate("enrolledStudents", "name email")
      .sort("-createdAt");
    res.json({ success: true, batches });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @GET /api/admin/courses
exports.getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find()
      .populate("instructor", "name email")
      .sort("-createdAt");
    res.json({ success: true, courses });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
