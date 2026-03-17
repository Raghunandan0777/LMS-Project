const router = require("express").Router();
const { getStudentDashboard, getCourseProgress } = require("../controllers/student.controller");
const { protect, authorize } = require("../middleware/auth");

router.get("/dashboard", protect, authorize("student"), getStudentDashboard);
router.get("/progress/:courseId", protect, authorize("student"), getCourseProgress);

module.exports = router;
