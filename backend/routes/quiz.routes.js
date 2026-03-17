const router = require("express").Router();
const {
  getQuizzesByBatch, getQuizById, createQuiz,
  updateQuiz, deleteQuiz, attemptQuiz, getQuizResults,
} = require("../controllers/quiz.controller");
const { protect, authorize } = require("../middleware/auth");

router.get("/batch/:batchId", protect, getQuizzesByBatch);
router.get("/:id", protect, getQuizById);
router.post("/", protect, authorize("instructor", "admin"), createQuiz);
router.put("/:id", protect, authorize("instructor", "admin"), updateQuiz);
router.delete("/:id", protect, authorize("instructor", "admin"), deleteQuiz);
router.post("/:id/attempt", protect, authorize("student"), attemptQuiz);
router.get("/:id/results", protect, authorize("instructor", "admin"), getQuizResults);

module.exports = router;
