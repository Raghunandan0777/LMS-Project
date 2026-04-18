<div align="center">

![EduFlow Logo](./logo.svg)

# 🚀 EduFlow

### Professional Learning Management System (MERN Stack)

**A full-featured LMS for educational institutions to manage courses, lessons, quizzes, and student progress**

</div>

---

A **professional, full-featured Learning Management System** built with MongoDB, Express.js, React, and Node.js. Designed for educational institutions to manage courses, lessons, quizzes, and student progress.

![MERN Stack](https://img.shields.io/badge/Stack-MERN-green)
![Node.js](https://img.shields.io/badge/Node.js-v14+-blue)
![React](https://img.shields.io/badge/React-18+-blue)
![MongoDB](https://img.shields.io/badge/MongoDB-Latest-green)

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)

### 1. Clone & Setup Backend

```bash
cd lms/backend
npm install
cp .env.example .env
# Edit .env — set MONGO_URI and JWT_SECRET
```

### 2. Seed Database (optional but recommended)

```bash
node seed.js
```

This creates demo users:
| Role | Email | Password |
|------------|------------------------|----------|
| Admin | admin@lms.com | admin123 |
| Instructor | instructor@lms.com | pass123 |
| Student | student@lms.com | pass123 |

### 3. Start Backend

```bash
npm run dev       # development (nodemon)
npm start         # production
```

Backend runs on `http://localhost:5000`

### 4. Setup & Start Frontend

```bash
cd lms/frontend
npm install
npm start
```

Frontend runs on `http://localhost:3000`

---

---

## 📋 Table of Contents

- [Features](#-features)
- [Project Structure](#-project-structure)
- [Tech Stack](#-tech-stack)
- [Quick Start](#-quick-start)
- [Environment Setup](#-environment-setup)
- [Deployment](#-deployment)
- [API Documentation](#-api-documentation)

---

## ✨ Features

### 👥 Role-Based Access Control

- **Admin**: System management, user management, analytics
- **Instructor**: Course creation, lesson management, quiz management
- **Student**: Course enrollment, learning, quiz taking, assignment submission

### 📚 Core Features

- ✅ User authentication & authorization (JWT)
- ✅ Course management with modules
- ✅ Interactive lessons with multimedia support
- ✅ Quiz creation & auto-grading
- ✅ Assignment management with submissions
- ✅ Student progress tracking
- ✅ File uploads (image/video via Cloudinary)
- ✅ Responsive dashboard design

---

## 📂 Project Structure

```
lms-mern-complete/
├── backend/                    # Node.js + Express API
│   ├── controllers/            # Route handlers
│   ├── models/                 # Mongoose schemas
│   ├── routes/                 # API endpoints
│   ├── middleware/             # Auth, upload handlers
│   ├── uploads/                # Local file storage
│   ├── server.js              # Express app setup
│   ├── package.json
│   └── .env                   # Environment variables
│
├── frontend/                   # React application
│   ├── src/
│   │   ├── components/        # Reusable React components
│   │   ├── pages/            # Page components by role
│   │   ├── context/          # React Context (Auth)
│   │   ├── api/              # Axios API client
│   │   ├── App.jsx
│   │   └── index.js
│   ├── public/
│   ├── package.json
│   └── .env                  # Environment variables
│
├── DEPLOYMENT_GUIDE.md        # Render deployment guide
├── README.md                  # This file
├── setup.bat                  # Windows setup script
└── setup.sh                   # Linux/Mac setup script
```

---

## 🛠️ Tech Stack

| Component          | Technology        | Version  |
| ------------------ | ----------------- | -------- |
| **Frontend**       | React             | 18+      |
| **Backend**        | Node.js + Express | 14+, 4.x |
| **Database**       | MongoDB           | Atlas    |
| **Authentication** | JWT               | -        |
| **File Upload**    | Cloudinary        | -        |
| **HTTP Client**    | Axios             | Latest   |

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** v14 or higher
- **npm** or **yarn**
- **MongoDB Atlas** account (free tier available)
- **Git**

### Installation

#### 1. Clone Repository

```bash
git clone https://github.com/Raghunandan0777/LMS-Project.git
cd lms-mern-complete
```

#### 2. Backend Setup

```bash
cd backend
npm install
npm start
```

Backend runs on `http://localhost:5000`

#### 3. Frontend Setup (New Terminal)

```bash
cd frontend
npm install
npm start
```

Frontend runs on `http://localhost:3000`

---

## 🔧 Environment Setup

### Backend `.env` File

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb+srv://username:password@cluster0.mongodb.net/?appName=Cluster0
JWT_SECRET=your_strong_secret_key_here
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:3000
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Frontend `.env` File

```env
REACT_APP_API_URL=http://localhost:5000/api
```

### Generate Strong JWT Secret

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 📡 API Endpoints

### Authentication

```
POST   /api/auth/register          Register new user
POST   /api/auth/login             Login user
GET    /api/auth/me                Get current user
PUT    /api/auth/profile           Update profile
```

### Courses

```
GET    /api/courses                Get all courses
GET    /api/courses/my             Get user's courses
POST   /api/courses                Create course (Instructor)
PUT    /api/courses/:id            Update course
PATCH  /api/courses/:id/publish    Publish course
DELETE /api/courses/:id            Delete course
```

### Quizzes & Assignments

```
GET    /api/quizzes                Get quizzes
POST   /api/quizzes                Create quiz
GET    /api/assignments            Get assignments
POST   /api/assignments/:id/submit Submit assignment
```

---

## 🚀 Deployment

### Production URLs

- **Frontend**: https://lms-complete-project.onrender.com
- **Backend**: https://lms-project-odk6.onrender.com

For detailed deployment instructions, see [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)

### Deploy to Render

1. Set backend environment variables in Render dashboard
2. Set frontend environment variables in Render dashboard
3. Both services auto-redeploy
4. Visit frontend URL

---

## 🔐 Security Features

- ✅ JWT-based authentication
- ✅ Password hashing (bcrypt)
- ✅ CORS protection
- ✅ Role-based access control
- ✅ Secure environment variables
- ✅ HTTPS in production

---

## 🐛 Troubleshooting

### "CORS Error"

**Solution**: Ensure `CLIENT_URL` in backend `.env` matches your frontend URL

### "MongoDB Connection Failed"

**Solution**: Check `MONGO_URI` and allow IP in MongoDB Atlas

### "Cannot read property 'undefined is not valid JSON'"

**Solution**: Clear browser localStorage and login again

---

## 🤝 Contributing

Contributions are welcome! Fork the repository and create a pull request.

---

## 📧 Contact

- **Author**: Raghunandan
- **GitHub**: [@Raghunandan0777](https://github.com/Raghunandan0777)
- **Repository**: [LMS-Project](https://github.com/Raghunandan0777/LMS-Project)

---

**⭐ If you find this project helpful, please give it a star!**

```
lms/
├── backend/
│   ├── server.js               # Entry point
│   ├── seed.js                 # Database seeder
│   ├── .env.example
│   ├── models/
│   │   ├── User.js             # Student / Instructor / Admin
│   │   ├── Course.js           # Course with modules array
│   │   ├── Lesson.js           # Module + Lesson models
│   │   ├── Batch.js            # Enrollment batches
│   │   ├── ClassSchedule.js    # Live class scheduling
│   │   ├── Assignment.js       # Assignments + Submissions sub-doc
│   │   ├── Quiz.js             # Quizzes + Attempts sub-doc
│   │   └── Progress.js         # Student progress tracker
│   ├── controllers/            # Business logic (9 controllers)
│   ├── middleware/
│   │   ├── auth.js             # JWT protect + authorize(roles)
│   │   └── upload.js           # Multer file uploads
│   └── routes/                 # 9 route files
│
└── frontend/
    └── src/
        ├── App.jsx             # Routes + role protection
        ├── api/index.js        # All Axios API calls
        ├── context/
        │   └── AuthContext.jsx # Auth state + JWT
        ├── components/layout/  # Sidebar + DashboardLayout
        └── pages/
            ├── auth/           # Login, Register
            ├── student/        # Dashboard, Courses, Batches, Classes,
            │                   # Assignments, Quizzes, QuizAttempt
            ├── instructor/     # Dashboard, Courses, CourseBuilder,
            │                   # Batches, Classes, Assignments, Quizzes, QuizBuilder
            ├── admin/          # Dashboard, Users, Courses,
            │                   # Enrollments, Instructors
            └── shared/         # Profile (all roles)
```

---

## 🔑 Features by Role

### 👨‍🎓 Student

- Browse and view course catalogue
- Enroll in batches
- View structured curriculum (modules → lessons)
- Mark lessons as complete with progress tracking
- Join live classes via meeting links
- Submit assignments (before/after deadline)
- View grade and feedback after grading
- Attempt MCQ quizzes with auto-scoring + timer
- View quiz results instantly

### 👩‍🏫 Instructor

- Create / edit / delete courses with thumbnail
- Publish / unpublish courses
- Build curriculum: add modules → add lessons (text / video / PDF)
- Create batches with date range + capacity
- Schedule live classes with meeting links
- Create assignments with deadlines + instruction files
- Grade student submissions with marks + feedback
- Create MCQ quizzes with the quiz builder
- View quiz results / analytics per student

### 🛡 Admin

- Platform stats dashboard (students, instructors, courses, enrollments)
- Approve / reject instructor registrations
- View all users with role filtering
- View all courses across all instructors
- View all batch enrollments

---

## 🌐 API Endpoints

### Auth

| Method | Endpoint                    | Description      |
| ------ | --------------------------- | ---------------- |
| POST   | `/api/auth/register`        | Register         |
| POST   | `/api/auth/login`           | Login            |
| GET    | `/api/auth/me`              | Get current user |
| PUT    | `/api/auth/profile`         | Update profile   |
| PUT    | `/api/auth/change-password` | Change password  |

### Courses

| Method | Endpoint                   | Access           |
| ------ | -------------------------- | ---------------- |
| GET    | `/api/courses`             | Public           |
| GET    | `/api/courses/my`          | Instructor       |
| GET    | `/api/courses/:id`         | Public           |
| POST   | `/api/courses`             | Instructor       |
| PUT    | `/api/courses/:id`         | Instructor/Admin |
| DELETE | `/api/courses/:id`         | Instructor/Admin |
| PATCH  | `/api/courses/:id/publish` | Instructor       |

### Full API covers: Lessons, Modules, Batches, Classes, Assignments, Quizzes, Admin, Student Dashboard

---

## 🔧 Environment Variables

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/eduflow_db
JWT_SECRET=your_super_secret_key
JWT_EXPIRE=7d
NODE_ENV=development
```

---

## 📦 Tech Stack

| Layer         | Technology                               |
| ------------- | ---------------------------------------- |
| Frontend      | React 18, React Router v6                |
| Styling       | Pure CSS with CSS variables (dark theme) |
| HTTP Client   | Axios                                    |
| Backend       | Node.js, Express.js                      |
| Database      | MongoDB, Mongoose                        |
| Auth          | JWT (jsonwebtoken + bcryptjs)            |
| File Upload   | Multer (local storage)                   |
| Notifications | react-hot-toast                          |
| Icons         | react-icons (Material Design)            |
| Date Utils    | date-fns                                 |

#   L M S - P r o j e c t 
 
 #   L M S - P r o j e c t 
 
 
