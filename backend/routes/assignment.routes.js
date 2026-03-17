const router = require("express").Router();
const {
  getAssignmentsByBatch, getAssignmentById, createAssignment,
  updateAssignment, deleteAssignment, submitAssignment, gradeSubmission,
} = require("../controllers/assignment.controller");
const { protect, authorize } = require("../middleware/auth");
const { uploadAssignment } = require("../middleware/upload");

router.get("/batch/:batchId", protect, getAssignmentsByBatch);
router.get("/:id", protect, getAssignmentById);
router.post("/", protect, authorize("instructor", "admin"), uploadAssignment.single("instructionFile"), createAssignment);
router.put("/:id", protect, authorize("instructor", "admin"), uploadAssignment.single("instructionFile"), updateAssignment);
router.delete("/:id", protect, authorize("instructor", "admin"), deleteAssignment);
router.post("/:id/submit", protect, authorize("student"), uploadAssignment.single("submission"), submitAssignment);
router.put("/:id/grade/:submissionId", protect, authorize("instructor", "admin"), gradeSubmission);

module.exports = router;
