import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { adminAPI } from "../../api";
import { MdPeople, MdSchool, MdBook, MdBatchPrediction, MdHourglassTop, MdCheckCircle } from "react-icons/md";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState(null);

  const fetch = () => {
    Promise.all([adminAPI.getStats(), adminAPI.getPendingInstructors()])
      .then(([s, p]) => { setStats(s.data.stats); setPending(p.data.instructors); })
      .catch(console.error)
      .finally(() => setLoading(false));
  };
  useEffect(() => { fetch(); }, []);

  const handleApprove = async (id) => {
    setApproving(id);
    try { await adminAPI.approveInstructor(id); fetch(); }
    catch { }
    finally { setApproving(null); }
  };

  const handleReject = async (id) => {
    if (!window.confirm("Reject and remove this instructor?")) return;
    try { await adminAPI.rejectInstructor(id); fetch(); }
    catch { }
  };

  if (loading) return <div className="spinner" />;

  const statCards = [
    { label: "Total Students", value: stats?.totalStudents, icon: <MdPeople />, color: "var(--blue-dim)", text: "var(--blue)", to: "/admin/users?role=student" },
    { label: "Total Instructors", value: stats?.totalInstructors, icon: <MdSchool />, color: "var(--accent-dim)", text: "var(--accent2)", to: "/admin/users?role=instructor" },
    { label: "Total Courses", value: stats?.totalCourses, icon: <MdBook />, color: "var(--green-dim)", text: "var(--green)", to: "/admin/courses" },
    { label: "Total Batches", value: stats?.totalBatches, icon: <MdBatchPrediction />, color: "var(--amber-dim)", text: "var(--amber)", to: "/admin/enrollments" },
    { label: "Total Enrollments", value: stats?.totalEnrollments, icon: <MdSchool />, color: "var(--green-dim)", text: "var(--green)", to: "/admin/enrollments" },
    { label: "Pending Approvals", value: stats?.pendingInstructors, icon: <MdHourglassTop />, color: "var(--red-dim)", text: "var(--red)", to: "/admin/instructors" },
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Admin Dashboard</h1>
          <p className="page-subtitle">Platform overview and management</p>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid-3" style={{ marginBottom: 36 }}>
        {statCards.map((s) => (
          <Link to={s.to} key={s.label} style={{ textDecoration: "none" }}>
            <div className="stat-card">
              <div className="stat-icon" style={{ background: s.color, color: s.text }}>{s.icon}</div>
              <div>
                <div className="stat-value">{s.value ?? "—"}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Pending instructor approvals */}
      {pending.length > 0 && (
        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700 }}>
              Pending Instructor Approvals
              <span style={{ marginLeft: 10, fontSize: 14, background: "var(--red-dim)", color: "var(--red)", padding: "2px 10px", borderRadius: 20, fontWeight: 600 }}>{pending.length}</span>
            </h2>
            <Link to="/admin/instructors" style={{ fontSize: 13, color: "var(--accent2)" }}>View all →</Link>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Name</th><th>Email</th><th>Registered</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {pending.map((inst) => (
                  <tr key={inst._id}>
                    <td><div style={{ fontWeight: 600 }}>{inst.name}</div></td>
                    <td>{inst.email}</td>
                    <td>{new Date(inst.createdAt).toLocaleDateString()}</td>
                    <td>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button className="btn btn-success btn-sm" disabled={approving === inst._id} onClick={() => handleApprove(inst._id)}>
                          <MdCheckCircle size={14} /> {approving === inst._id ? "..." : "Approve"}
                        </button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleReject(inst._id)}>Reject</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {pending.length === 0 && (
        <div className="card" style={{ textAlign: "center", padding: 40 }}>
          <MdCheckCircle size={40} style={{ color: "var(--green)", marginBottom: 12 }} />
          <h3 style={{ fontSize: 18, fontWeight: 700 }}>All caught up!</h3>
          <p style={{ color: "var(--text2)", marginTop: 8 }}>No pending instructor approvals</p>
        </div>
      )}
    </div>
  );
}
