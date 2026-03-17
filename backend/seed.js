// seed.js - Run with: node seed.js
require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const User = require("./models/User");
const Course = require("./models/Course");
const { Module, Lesson } = require("./models/Lesson");
const Batch = require("./models/Batch");

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB");

  // Clear existing
  await Promise.all([
    User.deleteMany({}),
    Course.deleteMany({}),
    Module.deleteMany({}),
    Lesson.deleteMany({}),
    Batch.deleteMany({}),
  ]);
  console.log("Cleared existing data");

  // Create users
  const adminUser = await User.create({
    name: "Super Admin",
    email: "admin@lms.com",
    password: "admin123",
    role: "admin",
    isApproved: true,
  });

  const instructorUser = await User.create({
    name: "John Instructor",
    email: "instructor@lms.com",
    password: "pass123",
    role: "instructor",
    isApproved: true,
    bio: "10 years experience in web development",
  });

  const studentUser = await User.create({
    name: "Jane Student",
    email: "student@lms.com",
    password: "pass123",
    role: "student",
  });

  const student2 = await User.create({
    name: "Bob Learner",
    email: "bob@lms.com",
    password: "pass123",
    role: "student",
  });

  console.log("Users created");

  // Create course
  const course = await Course.create({
    title: "Complete React Developer Course",
    description: "Learn React from scratch to advanced concepts including hooks, context, Redux and more. Build real-world projects and become a confident React developer.",
    price: 1999,
    duration: "12 weeks",
    category: "Web Development",
    level: "Beginner",
    instructor: instructorUser._id,
    isPublished: true,
  });

  // Create modules
  const mod1 = await Module.create({
    title: "Introduction to React",
    description: "Getting started with React and JSX",
    course: course._id,
    order: 1,
  });

  const mod2 = await Module.create({
    title: "React Hooks",
    description: "useState, useEffect and custom hooks",
    course: course._id,
    order: 2,
  });

  // Create lessons
  const lessons1 = await Lesson.insertMany([
    { title: "What is React?", type: "text", content: "React is a JavaScript library for building user interfaces...", duration: 10, order: 1, module: mod1._id, course: course._id, isPreview: true },
    { title: "Setting Up Your Environment", type: "video", content: "/uploads/videos/sample.mp4", duration: 15, order: 2, module: mod1._id, course: course._id },
    { title: "JSX Fundamentals", type: "pdf", content: "/uploads/pdfs/jsx-guide.pdf", duration: 20, order: 3, module: mod1._id, course: course._id },
  ]);

  const lessons2 = await Lesson.insertMany([
    { title: "useState Hook", type: "text", content: "useState is the most fundamental React hook...", duration: 25, order: 1, module: mod2._id, course: course._id },
    { title: "useEffect Hook", type: "video", content: "/uploads/videos/sample2.mp4", duration: 30, order: 2, module: mod2._id, course: course._id },
    { title: "Custom Hooks", type: "text", content: "Custom hooks let you extract component logic...", duration: 20, order: 3, module: mod2._id, course: course._id },
  ]);

  mod1.lessons = lessons1.map((l) => l._id);
  mod2.lessons = lessons2.map((l) => l._id);
  await mod1.save();
  await mod2.save();

  course.modules = [mod1._id, mod2._id];
  await course.save();

  console.log("Course & curriculum created");

  // Create batch
  const batch = await Batch.create({
    name: "React Batch — Jan 2025",
    course: course._id,
    instructor: instructorUser._id,
    startDate: new Date("2025-01-10"),
    endDate: new Date("2025-04-10"),
    capacity: 30,
    enrolledStudents: [studentUser._id, student2._id],
  });

  // Update students
  await User.updateMany(
    { _id: { $in: [studentUser._id, student2._id] } },
    { $addToSet: { enrolledBatches: batch._id } }
  );

  console.log("Batch created with enrollments");
  console.log("\n✅ Seed complete!\n");
  console.log("Login credentials:");
  console.log("  Admin:      admin@lms.com      / admin123");
  console.log("  Instructor: instructor@lms.com / pass123");
  console.log("  Student:    student@lms.com    / pass123");
  console.log("  Student 2:  bob@lms.com        / pass123");

  await mongoose.disconnect();
}

seed().catch((err) => { console.error(err); process.exit(1); });
