import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";
import {
  MdDashboard, MdMenuBook, MdPeople, MdVideoCall, MdAssignment,
  MdQuiz, MdAdminPanelSettings, MdLogout, MdPerson, MdSchool,
  MdCalendarToday, MdBatchPrediction, MdSettings,
} from "react-icons/md";

const studentLinks = [
  { to: "/student", label: "Dashboard", icon: <MdDashboard /> },
  { to: "/student/courses", label: "Browse Courses", icon: <MdMenuBook /> },
  { to: "/student/batches", label: "My Batches", icon: <MdBatchPrediction /> },
  { to: "/student/classes", label: "Live Classes", icon: <MdVideoCall /> },
  { to: "/student/assignments", label: "Assignments", icon: <MdAssignment /> },
  { to: "/student/quizzes", label: "Quizzes", icon: <MdQuiz /> },
];

const instructorLinks = [
  { to: "/instructor", label: "Dashboard", icon: <MdDashboard /> },
  { to: "/instructor/courses", label: "My Courses", icon: <MdMenuBook /> },
  { to: "/instructor/batches", label: "Batches", icon: <MdBatchPrediction /> },
  { to: "/instructor/classes", label: "Live Classes", icon: <MdVideoCall /> },
  { to: "/instructor/assignments", label: "Assignments", icon: <MdAssignment /> },
  { to: "/instructor/quizzes", label: "Quizzes", icon: <MdQuiz /> },
];

const adminLinks = [
  { to: "/admin", label: "Dashboard", icon: <MdAdminPanelSettings /> },
  { to: "/admin/users", label: "Users", icon: <MdPeople /> },
  { to: "/admin/courses", label: "Courses", icon: <MdMenuBook /> },
  { to: "/admin/enrollments", label: "Enrollments", icon: <MdSchool /> },
  { to: "/admin/instructors", label: "Instructors", icon: <MdPerson /> },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const links =
    user?.role === "admin" ? adminLinks :
    user?.role === "instructor" ? instructorLinks :
    studentLinks;

  const basePath =
    user?.role === "admin" ? "/admin" :
    user?.role === "instructor" ? "/instructor" : "/student";

  const handleLogout = () => {
    logout();
    toast.success("Logged out");
    navigate("/login");
  };

  const initials = user?.name?.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <h1>Learn<span>Hub</span></h1>
        <div style={{ fontSize: 12, color: "var(--text3)", marginTop: 4 }}>
          {user?.role?.toUpperCase()}
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section">Menu</div>
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === basePath}
            className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}
          >
            {link.icon}
            {link.label}
          </NavLink>
        ))}
        <div className="nav-section" style={{ marginTop: 12 }}>Account</div>
        <NavLink to={`${basePath}/profile`} className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}>
          <MdSettings /> Profile & Settings
        </NavLink>
      </nav>

      <div className="sidebar-footer">
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
          <div className="user-avatar">{initials}</div>
          <div style={{ overflow: "hidden" }}>
            <div style={{ fontWeight: 600, fontSize: 14, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {user?.name}
            </div>
            <div style={{ fontSize: 12, color: "var(--text3)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {user?.email}
            </div>
          </div>
        </div>
        <button className="btn btn-secondary w-full btn-sm" onClick={handleLogout}>
          <MdLogout /> Logout
        </button>
      </div>
    </aside>
  );
}
