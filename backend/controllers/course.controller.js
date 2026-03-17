const Course = require("../models/Course");
const { Module, Lesson } = require("../models/Lesson");
const path = require("path");

// @GET /api/courses  (public - students can view)
exports.getCourses = async (req, res) => {
  try {
    const { category, level, search } = req.query;
    const query = { isPublished: true };
    if (category) query.category = category;
    if (level) query.level = level;
    if (search) query.title = { $regex: search, $options: "i" };

    const courses = await Course.find(query)
      .populate("instructor", "name avatar")
      .select("-modules")
      .sort("-createdAt");

    res.json({ success: true, count: courses.length, courses });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @GET /api/courses/my  (instructor's own courses)
exports.getMyCourses = async (req, res) => {
  try {
    const courses = await Course.find({ instructor: req.user._id })
      .populate("instructor", "name avatar")
      .sort("-createdAt");
    res.json({ success: true, courses });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @GET /api/courses/:id
exports.getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate("instructor", "name avatar bio")
      .populate({
        path: "modules",
        populate: { path: "lessons", select: "title type duration isPreview order" },
      });
    if (!course) return res.status(404).json({ success: false, message: "Course not found" });
    res.json({ success: true, course });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @POST /api/courses
exports.createCourse = async (req, res) => {
  try {
    const { title, description, price, duration, category, level } = req.body;
    const thumbnail = req.file ? `/uploads/thumbnails/${req.file.filename}` : "";
    const course = await Course.create({
      title, description, price, duration, category, level, thumbnail,
      instructor: req.user._id,
    });
    res.status(201).json({ success: true, course });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @PUT /api/courses/:id
exports.updateCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ success: false, message: "Course not found" });
    if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }
    const updates = { ...req.body };
    if (req.file) updates.thumbnail = `/uploads/thumbnails/${req.file.filename}`;
    const updated = await Course.findByIdAndUpdate(req.params.id, updates, { new: true });
    res.json({ success: true, course: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @DELETE /api/courses/:id
exports.deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ success: false, message: "Course not found" });
    if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }
    await Module.deleteMany({ course: req.params.id });
    await Lesson.deleteMany({ course: req.params.id });
    await Course.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Course deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @PATCH /api/courses/:id/publish
exports.togglePublish = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ success: false, message: "Course not found" });
    if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }
    course.isPublished = !course.isPublished;
    await course.save();
    res.json({ success: true, isPublished: course.isPublished });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
