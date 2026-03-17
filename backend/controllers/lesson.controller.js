const { Module, Lesson } = require("../models/Lesson");
const Course = require("../models/Course");
const Progress = require("../models/Progress");

// ─── MODULE CONTROLLERS ────────────────────────────────────

// @POST /api/lessons/module
exports.createModule = async (req, res) => {
  try {
    const { title, description, courseId, order } = req.body;
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ success: false, message: "Course not found" });
    if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }
    const module = await Module.create({ title, description, course: courseId, order });
    course.modules.push(module._id);
    await course.save();
    res.status(201).json({ success: true, module });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @PUT /api/lessons/module/:id
exports.updateModule = async (req, res) => {
  try {
    const module = await Module.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!module) return res.status(404).json({ success: false, message: "Module not found" });
    res.json({ success: true, module });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @DELETE /api/lessons/module/:id
exports.deleteModule = async (req, res) => {
  try {
    const module = await Module.findById(req.params.id);
    if (!module) return res.status(404).json({ success: false, message: "Module not found" });
    await Lesson.deleteMany({ module: req.params.id });
    await Course.findByIdAndUpdate(module.course, { $pull: { modules: module._id } });
    await Module.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Module deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── LESSON CONTROLLERS ────────────────────────────────────

// @POST /api/lessons
exports.createLesson = async (req, res) => {
  try {
    const { title, type, content, duration, order, moduleId, courseId, isPreview } = req.body;
    let lessonContent = content;

    if (req.file) {
      lessonContent = `/uploads/${type === "video" ? "videos" : "pdfs"}/${req.file.filename}`;
    }

    const lesson = await Lesson.create({
      title, type, content: lessonContent, duration, order, isPreview,
      module: moduleId, course: courseId,
    });

    await Module.findByIdAndUpdate(moduleId, { $push: { lessons: lesson._id } });
    res.status(201).json({ success: true, lesson });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @PUT /api/lessons/:id
exports.updateLesson = async (req, res) => {
  try {
    const updates = { ...req.body };
    if (req.file) {
      updates.content = `/uploads/${req.body.type === "video" ? "videos" : "pdfs"}/${req.file.filename}`;
    }
    const lesson = await Lesson.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!lesson) return res.status(404).json({ success: false, message: "Lesson not found" });
    res.json({ success: true, lesson });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @DELETE /api/lessons/:id
exports.deleteLesson = async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id);
    if (!lesson) return res.status(404).json({ success: false, message: "Lesson not found" });
    await Module.findByIdAndUpdate(lesson.module, { $pull: { lessons: lesson._id } });
    await Lesson.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Lesson deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @POST /api/lessons/:id/complete  (student marks lesson as complete)
exports.markLessonComplete = async (req, res) => {
  try {
    const { courseId, batchId } = req.body;
    let progress = await Progress.findOne({ student: req.user._id, course: courseId });

    if (!progress) {
      progress = await Progress.create({
        student: req.user._id, course: courseId, batch: batchId, completedLessons: [],
      });
    }

    if (!progress.completedLessons.includes(req.params.id)) {
      progress.completedLessons.push(req.params.id);
    }

    // Calculate percentage
    const totalLessons = await Lesson.countDocuments({ course: courseId });
    progress.progressPercentage = totalLessons
      ? Math.round((progress.completedLessons.length / totalLessons) * 100)
      : 0;
    progress.lastAccessed = Date.now();
    await progress.save();

    res.json({ success: true, progress });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
