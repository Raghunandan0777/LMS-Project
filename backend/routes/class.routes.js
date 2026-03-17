// class.routes.js
const classRouter = require("express").Router();
const {
  getClassesByBatch, getUpcomingClasses, getInstructorClasses,
  createClass, updateClass, deleteClass,
} = require("../controllers/class.controller");
const { protect, authorize } = require("../middleware/auth");

classRouter.get("/upcoming", protect, authorize("student"), getUpcomingClasses);
classRouter.get("/instructor", protect, authorize("instructor", "admin"), getInstructorClasses);
classRouter.get("/batch/:batchId", protect, getClassesByBatch);
classRouter.post("/", protect, authorize("instructor", "admin"), createClass);
classRouter.put("/:id", protect, authorize("instructor", "admin"), updateClass);
classRouter.delete("/:id", protect, authorize("instructor", "admin"), deleteClass);

module.exports = classRouter;
