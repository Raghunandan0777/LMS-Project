const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const morgan = require("morgan");
const path = require("path");
require("dotenv").config();

const app = express();

// Middleware
app.use(cors({ origin: process.env.CLIENT_URL || "https://lms-complete-project.onrender.com", "allowedHeaders": ["Content-Type", "Authorization"], credentials: true }));
app.use(express.json())
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Root route
app.get("/", (req, res) => {
  res.json({ message: "LMS Backend API is running", status: "ok" });
});

// Routes
app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/courses", require("./routes/course.routes"));
app.use("/api/lessons", require("./routes/lesson.routes"));
app.use("/api/batches", require("./routes/batch.routes"));
app.use("/api/classes", require("./routes/class.routes"));
app.use("/api/assignments", require("./routes/assignment.routes"));
app.use("/api/quizzes", require("./routes/quiz.routes"));
app.use("/api/admin", require("./routes/admin.routes"));
app.use("/api/student", require("./routes/student.routes"));

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ success: false, message: err.message || "Server Error" });
});

// DB + Start
const startServer = (port = process.env.PORT || 5000, retries = 3) => {
  mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
      console.log("✓ MongoDB Connected");

      const server = app.listen(port, "0.0.0.0", () => {
        console.log(`✓ Server running on port ${port}`);
      });

      // Handle port already in use
      server.on("error", (err) => {
        if (err.code === "EADDRINUSE") {
          console.error(`✗ Port ${port} is already in use. Retrying with port ${port + 1}...`);
          if (retries > 0) {
            setTimeout(() => startServer(port + 1, retries - 1), 2000);
          } else {
            console.error("✗ Could not find available port after retries.");
            process.exit(1);
          }
        } else {
          console.error("✗ Server error:", err.message);
          process.exit(1);
        }
      });

      // Graceful shutdown
      process.on("SIGTERM", () => {
        console.log("SIGTERM received, closing server...");
        server.close(() => {
          console.log("Server closed");
          process.exit(0);
        });
      });
    })
    .catch((err) => {
      console.error("✗ DB connection failed:", err.message);
      setTimeout(() => startServer(port, retries - 1), 3000);
    });
};

startServer();
