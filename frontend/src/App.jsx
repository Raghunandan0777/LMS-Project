import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider, useAuth } from "./context/AuthContext";

// Auth pages
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

// Layout
import DashboardLayout from "./components/layout/DashboardLayout";

// Student pages
import StudentDashboard from "./pages/student/Dashboard";
import StudentCourses from "./pages/student/Courses";
import CourseDetail from "./pages/student/CourseDetail";
import StudentBatches from "./pages/student/Batches";
import BatchDetail from "./pages/student/BatchDetail";
import StudentClasses from "./pages/student/Classes";
import StudentAssignments from "./pages/student/Assignments";
import StudentQuizzes from "./pages/student/Quizzes";
import QuizAttempt from "./pages/student/QuizAttempt";

// Instructor pages
import InstructorDashboard from "./pages/instructor/Dashboard";
import InstructorCourses from "./pages/instructor/Courses";
import CourseBuilder from "./pages/instructor/CourseBuilder";
import InstructorBatches from "./pages/instructor/Batches";
import InstructorClasses from "./pages/instructor/Classes";
import InstructorAssignments from "./pages/instructor/Assignments";
import InstructorQuizzes from "./pages/instructor/Quizzes";
import QuizBuilder from "./pages/instructor/QuizBuilder";

// Admin pages
import AdminDashboard from "./pages/admin/Dashboard";
import AdminUsers from "./pages/admin/Users";
import AdminCourses from "./pages/admin/Courses";
import AdminEnrollments from "./pages/admin/Enrollments";
import AdminInstructors from "./pages/admin/Instructors";

// Shared
import Profile from "./pages/shared/Profile";
import LandingPage from "./pages/shared/LandingPage";

const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="spinner" />;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to={`/${user.role}`} replace />;
  return children;
};

const RoleRedirect = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={`/${user.role}`} replace />;
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" toastOptions={{
          style: { background: "var(--bg3)", color: "var(--text)", border: "1px solid var(--border)" },
        }} />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Student Routes */}
          <Route path="/student" element={<ProtectedRoute roles={["student"]}><DashboardLayout /></ProtectedRoute>}>
            <Route index element={<StudentDashboard />} />
            <Route path="courses" element={<StudentCourses />} />
            <Route path="courses/:id" element={<CourseDetail />} />
            <Route path="batches" element={<StudentBatches />} />
            <Route path="batches/:id" element={<BatchDetail />} />
            <Route path="classes" element={<StudentClasses />} />
            <Route path="assignments" element={<StudentAssignments />} />
            <Route path="quizzes" element={<StudentQuizzes />} />
            <Route path="quizzes/:id/attempt" element={<QuizAttempt />} />
            <Route path="profile" element={<Profile />} />
          </Route>

          {/* Instructor Routes */}
          <Route path="/instructor" element={<ProtectedRoute roles={["instructor"]}><DashboardLayout /></ProtectedRoute>}>
            <Route index element={<InstructorDashboard />} />
            <Route path="courses" element={<InstructorCourses />} />
            <Route path="courses/:id/builder" element={<CourseBuilder />} />
            <Route path="batches" element={<InstructorBatches />} />
            <Route path="classes" element={<InstructorClasses />} />
            <Route path="assignments" element={<InstructorAssignments />} />
            <Route path="quizzes" element={<InstructorQuizzes />} />
            <Route path="quizzes/:id/builder" element={<QuizBuilder />} />
            <Route path="profile" element={<Profile />} />
          </Route>

          {/* Admin Routes */}
          <Route path="/admin" element={<ProtectedRoute roles={["admin"]}><DashboardLayout /></ProtectedRoute>}>
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="courses" element={<AdminCourses />} />
            <Route path="enrollments" element={<AdminEnrollments />} />
            <Route path="instructors" element={<AdminInstructors />} />
            <Route path="profile" element={<Profile />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
