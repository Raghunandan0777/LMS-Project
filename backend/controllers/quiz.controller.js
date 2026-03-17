const Quiz = require("../models/Quiz");
const Batch = require("../models/Batch");

// @GET /api/quizzes/batch/:batchId
exports.getQuizzesByBatch = async (req, res) => {
  try {
    const quizzes = await Quiz.find({ batch: req.params.batchId, isActive: true })
      .populate("instructor", "name avatar")
      .select("-questions.correctOption -attempts");
    res.json({ success: true, quizzes });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @GET /api/quizzes/:id
exports.getQuizById = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id).populate("instructor", "name avatar");
    if (!quiz) return res.status(404).json({ success: false, message: "Quiz not found" });

    // For students: hide correct answers, show their attempt if exists
    if (req.user.role === "student") {
      const myAttempt = quiz.attempts.find(
        (a) => a.student.toString() === req.user._id.toString()
      );
      const sanitized = quiz.toObject();
      sanitized.questions = sanitized.questions.map((q) => {
        const { correctOption, ...rest } = q;
        return rest;
      });
      sanitized.myAttempt = myAttempt || null;
      delete sanitized.attempts;
      return res.json({ success: true, quiz: sanitized });
    }

    res.json({ success: true, quiz });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @POST /api/quizzes  (instructor creates)
exports.createQuiz = async (req, res) => {
  try {
    const { title, description, batchId, questions, passingMarks, duration } = req.body;
    const batch = await Batch.findById(batchId);
    if (!batch) return res.status(404).json({ success: false, message: "Batch not found" });
    const quiz = await Quiz.create({
      title, description, batch: batchId, instructor: req.user._id,
      questions, passingMarks, duration,
    });
    res.status(201).json({ success: true, quiz });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @PUT /api/quizzes/:id
exports.updateQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ success: false, message: "Quiz not found" });
    if (quiz.instructor.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }
    const updated = await Quiz.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, quiz: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @DELETE /api/quizzes/:id
exports.deleteQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ success: false, message: "Quiz not found" });
    if (quiz.instructor.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }
    await Quiz.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Quiz deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @POST /api/quizzes/:id/attempt  (student attempts)
exports.attemptQuiz = async (req, res) => {
  try {
    const { answers } = req.body; // [{ questionIndex, selectedOption }]
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz || !quiz.isActive) {
      return res.status(404).json({ success: false, message: "Quiz not found or inactive" });
    }

    const alreadyAttempted = quiz.attempts.find(
      (a) => a.student.toString() === req.user._id.toString()
    );
    if (alreadyAttempted) {
      return res.status(400).json({ success: false, message: "Already attempted this quiz" });
    }

    // Calculate score
    let score = 0;
    answers.forEach(({ questionIndex, selectedOption }) => {
      const question = quiz.questions[questionIndex];
      if (question && question.correctOption === selectedOption) {
        score += question.marks;
      }
    });

    const passed = score >= quiz.passingMarks;
    quiz.attempts.push({ student: req.user._id, answers, score, passed });
    await quiz.save();

    res.json({
      success: true,
      result: {
        score,
        totalMarks: quiz.totalMarks,
        passingMarks: quiz.passingMarks,
        passed,
        percentage: Math.round((score / quiz.totalMarks) * 100),
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @GET /api/quizzes/:id/results  (instructor sees all results)
exports.getQuizResults = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id)
      .populate("attempts.student", "name email avatar");
    if (!quiz) return res.status(404).json({ success: false, message: "Quiz not found" });
    res.json({ success: true, attempts: quiz.attempts, totalMarks: quiz.totalMarks, passingMarks: quiz.passingMarks });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
