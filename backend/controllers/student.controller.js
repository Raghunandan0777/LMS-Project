const User = require("../models/User");
const Batch = require("../models/Batch");
const Progress = require("../models/Progress");
const ClassSchedule = require("../models/ClassSchedule");
const Assignment = require("../models/Assignment");
const Quiz = require("../models/Quiz");

// @GET /api/student/dashboard
exports.getStudentDashboard = async (req, res) => {
  try {
    const studentId = req.user._id;

    // Get enrolled batches
    const enrolledBatches = await Batch.find({ enrolledStudents: studentId })
      .populate("course", "title thumbnail description")
      .populate("instructor", "name avatar");

    // Get progress for each
    const progressList = await Progress.find({ student: studentId });
    const progressMap = {};
    progressList.forEach((p) => {
      progressMap[p.course.toString()] = p;
    });

    const enrolledCourses = enrolledBatches.map((b) => ({
      batch: { _id: b._id, name: b.name, startDate: b.startDate, endDate: b.endDate },
      course: b.course,
      instructor: b.instructor,
      progress: progressMap[b.course?._id?.toString()] || { progressPercentage: 0, completedLessons: [] },
    }));

    // Upcoming classes
    const upcomingClasses = await ClassSchedule.find({
      batch: { $in: enrolledBatches.map((b) => b._id) },
      date: { $gte: new Date() },
      status: "scheduled",
    })
      .populate("batch", "name")
      .populate("instructor", "name avatar")
      .sort("date")
      .limit(5);

    // Pending assignments
    const pendingAssignments = await Assignment.find({
      batch: { $in: enrolledBatches.map((b) => b._id) },
      deadline: { $gte: new Date() },
    }).select("title deadline batch totalMarks submissions");

    const myPendingAssignments = pendingAssignments.filter(
      (a) => !a.submissions.some((s) => s.student.toString() === studentId.toString())
    );

    // Stats
    const completedLessonsTotal = progressList.reduce(
      (sum, p) => sum + p.completedLessons.length, 0
    );

    res.json({
      success: true,
      dashboard: {
        enrolledCourses,
        upcomingClasses,
        pendingAssignments: myPendingAssignments.length,
        completedLessons: completedLessonsTotal,
        totalEnrolled: enrolledBatches.length,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @GET /api/student/progress/:courseId
exports.getCourseProgress = async (req, res) => {
  try {
    const progress = await Progress.findOne({
      student: req.user._id,
      course: req.params.courseId,
    }).populate("completedLessons", "title type");
    res.json({ success: true, progress: progress || { progressPercentage: 0, completedLessons: [] } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
