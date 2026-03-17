const router = require("express").Router();
const {
  createModule, updateModule, deleteModule,
  createLesson, updateLesson, deleteLesson, markLessonComplete,
} = require("../controllers/lesson.controller");
const { protect, authorize } = require("../middleware/auth");
const { uploadVideo, uploadPDF } = require("../middleware/upload");

const lessonUpload = (req, res, next) => {
  const type = req.body.type || req.query.type;
  if (type === "video") return uploadVideo.single("content")(req, res, next);
  if (type === "pdf") return uploadPDF.single("content")(req, res, next);
  next();
};

// Module routes
router.post("/module", protect, authorize("instructor", "admin"), createModule);
router.put("/module/:id", protect, authorize("instructor", "admin"), updateModule);
router.delete("/module/:id", protect, authorize("instructor", "admin"), deleteModule);

// Lesson routes
router.post("/", protect, authorize("instructor", "admin"), lessonUpload, createLesson);
router.put("/:id", protect, authorize("instructor", "admin"), lessonUpload, updateLesson);
router.delete("/:id", protect, authorize("instructor", "admin"), deleteLesson);
router.post("/:id/complete", protect, authorize("student"), markLessonComplete);

module.exports = router;
