const Assignment = require("../models/Assignment");
const Batch = require("../models/Batch");
const path = require("path");

// @GET /api/assignments/batch/:batchId
exports.getAssignmentsByBatch = async (req, res) => {
  try {
    const assignments = await Assignment.find({ batch: req.params.batchId })
      .populate("instructor", "name avatar")
      .select("-submissions.fileUrl")
      .sort("-createdAt");
    res.json({ success: true, assignments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @GET /api/assignments/:id
exports.getAssignmentById = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id)
      .populate("instructor", "name avatar")
      .populate("submissions.student", "name email avatar");
    if (!assignment) return res.status(404).json({ success: false, message: "Assignment not found" });

    // Students only see their own submission
    if (req.user.role === "student") {
      const mySubmission = assignment.submissions.find(
        (s) => s.student._id.toString() === req.user._id.toString()
      );
      const result = assignment.toObject();
      result.mySubmission = mySubmission || null;
      delete result.submissions;
      return res.json({ success: true, assignment: result });
    }

    res.json({ success: true, assignment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @POST /api/assignments  (instructor creates)
exports.createAssignment = async (req, res) => {
  try {
    const { title, description, batchId, deadline, totalMarks } = req.body;
    const batch = await Batch.findById(batchId);
    if (!batch) return res.status(404).json({ success: false, message: "Batch not found" });
    const instructionFile = req.file
      ? `/uploads/assignments/${req.file.filename}`
      : "";
    const assignment = await Assignment.create({
      title, description, batch: batchId, instructor: req.user._id,
      deadline, totalMarks, instructionFile,
    });
    res.status(201).json({ success: true, assignment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @PUT /api/assignments/:id
exports.updateAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) return res.status(404).json({ success: false, message: "Assignment not found" });
    if (assignment.instructor.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }
    const updates = { ...req.body };
    if (req.file) updates.instructionFile = `/uploads/assignments/${req.file.filename}`;
    const updated = await Assignment.findByIdAndUpdate(req.params.id, updates, { new: true });
    res.json({ success: true, assignment: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @DELETE /api/assignments/:id
exports.deleteAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) return res.status(404).json({ success: false, message: "Assignment not found" });
    if (assignment.instructor.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }
    await Assignment.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Assignment deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @POST /api/assignments/:id/submit  (student submits)
exports.submitAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) return res.status(404).json({ success: false, message: "Assignment not found" });

    const existing = assignment.submissions.find(
      (s) => s.student.toString() === req.user._id.toString()
    );
    if (existing) return res.status(400).json({ success: false, message: "Already submitted" });

    if (!req.file) return res.status(400).json({ success: false, message: "Submission file required" });

    const isLate = new Date() > new Date(assignment.deadline);
    assignment.submissions.push({
      student: req.user._id,
      fileUrl: `/uploads/assignments/${req.file.filename}`,
      fileName: req.file.originalname,
      status: isLate ? "late" : "submitted",
    });
    await assignment.save();
    res.json({ success: true, message: isLate ? "Submitted (late)" : "Submitted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @PUT /api/assignments/:id/grade/:submissionId  (instructor grades)
exports.gradeSubmission = async (req, res) => {
  try {
    const { grade, feedback } = req.body;
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) return res.status(404).json({ success: false, message: "Assignment not found" });

    const submission = assignment.submissions.id(req.params.submissionId);
    if (!submission) return res.status(404).json({ success: false, message: "Submission not found" });

    submission.grade = grade;
    submission.feedback = feedback;
    submission.status = "graded";
    await assignment.save();
    res.json({ success: true, message: "Graded successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
