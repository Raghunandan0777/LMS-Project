import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { courseAPI, batchAPI, classAPI } from "../../api";
import { MdBook, MdPeople, MdVideoCall, MdAdd, MdCalendarToday } from "react-icons/md";
import { format } from "date-fns";

export default function InstructorDashboard() {
  const [courses, setCourses] = useState([]);
  const [batches, setBatches] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([courseAPI.getMy(), batchAPI.getMy(), classAPI.getInstructor()])
      .then(([c, b, cl]) => {
        setCourses(c.data.courses);
        setBatches(b.data.batches);
        setClasses(cl.data.classes.filter((c) => new Date(c.date) >= new Date()).slice(0, 5));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const totalStudents = batches.reduce((s, b) => s + (b.enrolledStudents?.length || 0), 0);

  const stats = [
    { label: "My Courses", value: courses.length, icon: <MdBook />, color: "var(--accent-dim)", text: "var(--accent2)", to: "/instructor/courses" },
    { label: "My Batches", value: batches.length, icon: <MdPeople />, color: "var(--blue-dim)", text: "var(--blue)", to: "/instructor/batches" },
    { label: "Total Students", value: totalStudents, icon: <MdPeople />, color: "var(--green-dim)", text: "var(--green)", to: "/instructor/batches" },
    { label: "Scheduled Classes", value: classes.length, icon: <MdVideoCall />, color: "var(--amber-dim)", text: "var(--amber)", to: "/instructor/classes" },
  ];

  if (loading) return <div className="spinner" />;

  return (
    <div>
      <div className="page-header">
        <div><h1 className="page-title">Instructor Dashboard</h1><p className="page-subtitle">Manage your courses and students</p></div>
        <Link to="/instructor/courses" className="btn btn-primary"><MdAdd size={18} /> New Course</Link>
      </div>

      <div className="grid-4" style={{ marginBottom: 32 }}>
        {stats.map((s) => (
          <Link to={s.to} key={s.label} style={{ textDecoration: "none" }}>
            <div className="stat-card">
              <div className="stat-icon" style={{ background: s.color, color: s.text }}>{s.icon}</div>
              <div><div className="stat-value">{s.value}</div><div className="stat-label">{s.label}</div></div>
            </div>
          </Link>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        {/* Recent courses */}
        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700 }}>My Courses</h2>
            <Link to="/instructor/courses" style={{ fontSize: 13, color: "var(--accent2)" }}>Manage →</Link>
          </div>
          {courses.length === 0 ? (
            <div className="empty-state" style={{ padding: 24 }}>
              <p>No courses yet</p>
              <Link to="/instructor/courses" className="btn btn-primary btn-sm" style={{ marginTop: 12 }}><MdAdd size={14} /> Create Course</Link>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {courses.slice(0, 5).map((c) => (
                <div key={c._id} style={{ display: "flex", gap: 12, alignItems: "center", padding: "10px 12px", background: "var(--bg3)", borderRadius: "var(--radius-sm)" }}>
                  <div style={{ width: 40, height: 40, borderRadius: 8, background: "var(--bg4)", overflow: "hidden", flexShrink: 0 }}>
                    {c.thumbnail ? <img src={c.thumbnail} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>📚</div>}
                  </div>
                  <div style={{ flex: 1, overflow: "hidden" }}>
                    <div style={{ fontWeight: 600, fontSize: 14, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.title}</div>
                    <span className={`badge badge-${c.isPublished ? "green" : "amber"}`} style={{ fontSize: 10 }}>{c.isPublished ? "Published" : "Draft"}</span>
                  </div>
                  <Link to={`/instructor/courses/${c._id}/builder`} className="btn btn-secondary btn-sm">Edit</Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming classes */}
        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700 }}>Upcoming Classes</h2>
            <Link to="/instructor/classes" style={{ fontSize: 13, color: "var(--accent2)" }}>Manage →</Link>
          </div>
          {classes.length === 0 ? (
            <div className="empty-state" style={{ padding: 24 }}>
              <p>No upcoming classes</p>
              <Link to="/instructor/classes" className="btn btn-primary btn-sm" style={{ marginTop: 12 }}><MdAdd size={14} /> Schedule Class</Link>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {classes.map((cls) => (
                <div key={cls._id} style={{ padding: "12px 14px", background: "var(--bg3)", borderRadius: "var(--radius-sm)", borderLeft: "3px solid var(--blue)" }}>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{cls.title}</div>
                  <div style={{ fontSize: 12, color: "var(--text3)", marginTop: 4, display: "flex", alignItems: "center", gap: 6 }}>
                    <MdCalendarToday size={12} />
                    {format(new Date(cls.date), "MMM dd, yyyy · h:mm a")}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--text3)", marginTop: 2 }}>{cls.batch?.name}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
