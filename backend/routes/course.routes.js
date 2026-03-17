const router = require("express").Router();
const {
  getCourses, getMyCourses, getCourseById,
  createCourse, updateCourse, deleteCourse, togglePublish,
} = require("../controllers/course.controller");
const { protect, authorize } = require("../middleware/auth");
const { uploadThumbnail } = require("../middleware/upload");

router.get("/", getCourses);
router.get("/my", protect, authorize("instructor", "admin"), getMyCourses);
router.get("/:id", getCourseById);
router.post("/", protect, authorize("instructor", "admin"), uploadThumbnail.single("thumbnail"), createCourse);
router.put("/:id", protect, authorize("instructor", "admin"), uploadThumbnail.single("thumbnail"), updateCourse);
router.delete("/:id", protect, authorize("instructor", "admin"), deleteCourse);
router.patch("/:id/publish", protect, authorize("instructor", "admin"), togglePublish);

module.exports = router;
