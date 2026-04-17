import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import { useAuth } from "../../context/AuthContext";
import { MdMenu } from "react-icons/md";
import { useState } from "react";

export default function DashboardLayout() {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="layout">
      <div className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </div>
      {sidebarOpen && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 99 }}
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <div className="main-content">
        <div className="topbar">
          <button
            className="btn btn-secondary btn-sm sidebar-toggle"
            id="mobile-menu-btn"
            onClick={() => setSidebarOpen(true)}
          >
            <MdMenu size={18} />
          </button>
          <div style={{ fontSize: 14, color: "var(--text2)" }}>
            Welcome back, <span style={{ color: "var(--text)", fontWeight: 600 }}>{user?.name}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span className={`badge badge-${user?.role === "admin" ? "red" : user?.role === "instructor" ? "amber" : "blue"}`}>
              {user?.role}
            </span>
            <div className="user-avatar">
              {user?.name?.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
            </div>
          </div>
        </div>
        <div className="page-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
