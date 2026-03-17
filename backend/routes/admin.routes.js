const router = require("express").Router();
const {
  getDashboardStats, getAllUsers, getPendingInstructors,
  approveInstructor, rejectInstructor, deleteUser,
  getEnrollments, getAllCourses,
} = require("../controllers/admin.controller");
const { protect, authorize } = require("../middleware/auth");

router.use(protect, authorize("admin"));

router.get("/stats", getDashboardStats);
router.get("/users", getAllUsers);
router.get("/instructors/pending", getPendingInstructors);
router.patch("/instructors/:id/approve", approveInstructor);
router.patch("/instructors/:id/reject", rejectInstructor);
router.delete("/users/:id", deleteUser);
router.get("/enrollments", getEnrollments);
router.get("/courses", getAllCourses);

module.exports = router;
