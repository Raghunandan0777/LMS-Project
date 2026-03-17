const router = require("express").Router();
const {
  getBatches, getMyBatches, getBatchById,
  createBatch, updateBatch, enrollInBatch, unenrollFromBatch,
} = require("../controllers/batch.controller");
const { protect, authorize } = require("../middleware/auth");

router.get("/", protect, getBatches);
router.get("/my", protect, authorize("instructor", "admin"), getMyBatches);
router.get("/:id", protect, getBatchById);
router.post("/", protect, authorize("instructor", "admin"), createBatch);
router.put("/:id", protect, authorize("instructor", "admin"), updateBatch);
router.post("/:id/enroll", protect, authorize("student"), enrollInBatch);
router.delete("/:id/unenroll", protect, authorize("student"), unenrollFromBatch);

module.exports = router;
