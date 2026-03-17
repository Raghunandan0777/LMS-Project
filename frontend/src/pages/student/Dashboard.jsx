import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { studentAPI } from "../../api";
import { MdBook, MdVideoCall, MdAssignment, MdCheckCircle, MdOpenInNew, MdCalendarToday } from "react-icons/md";
import { format } from "date-fns";

export default function StudentDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    studentAPI.getDashboard()
      .then((res) => setData(res.data.dashboard))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="spinner" />;

  const stats = [
    { label: "Enrolled Courses", value: data?.totalEnrolled || 0, icon: <MdBook />, color: "var(--accent-dim)", text: "var(--accent2)" },
    { label: "Upcoming Classes", value: data?.upcomingClasses?.length || 0, icon: <MdVideoCall />, color: "var(--blue-dim)", text: "var(--blue)" },
    { label: "Pending Assignments", value: data?.pendingAssignments || 0, icon: <MdAssignment />, color: "var(--amber-dim)", text: "var(--amber)" },
    { label: "Lessons Completed", value: data?.completedLessons || 0, icon: <MdCheckCircle />, color: "var(--green-dim)", text: "var(--green)" },
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">My Dashboard</h1>
          <p className="page-subtitle">Track your learning progress</p>
        </div>
        <Link to="/student/courses" className="btn btn-primary">Browse Courses</Link>
      </div>

      {/* Stats */}
      <div className="grid-4" style={{ marginBottom: 32 }}>
        {stats.map((s) => (
          <div className="stat-card" key={s.label}>
            <div className="stat-icon" style={{ background: s.color, color: s.text }}>{s.icon}</div>
            <div>
              <div className="stat-value">{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        {/* Enrolled Courses */}
        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700 }}>My Courses</h2>
            <Link to="/student/batches" style={{ fontSize: 13, color: "var(--accent2)" }}>View all →</Link>
          </div>
          {data?.enrolledCourses?.length === 0 ? (
            <div className="empty-state" style={{ padding: 30 }}>
              <p>No enrolled courses yet</p>
              <Link to="/student/courses" className="btn btn-primary btn-sm" style={{ marginTop: 12 }}>Browse Courses</Link>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {data?.enrolledCourses?.map((item) => (
                <Link to={`/student/batches/${item.batch._id}`} key={item.batch._id}
                  style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 14px", background: "var(--bg3)", borderRadius: "var(--radius-sm)", transition: "background 0.2s", textDecoration: "none" }}
                  onMouseEnter={(e) => e.currentTarget.style.background = "var(--bg4)"}
                  onMouseLeave={(e) => e.currentTarget.style.background = "var(--bg3)"}
                >
                  <div style={{ width: 44, height: 44, borderRadius: 10, background: "var(--bg4)", overflow: "hidden", flexShrink: 0 }}>
                    {item.course?.thumbnail
                      ? <img src={item.course.thumbnail} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>📚</div>
                    }
                  </div>
                  <div style={{ flex: 1, overflow: "hidden" }}>
                    <div style={{ fontWeight: 600, fontSize: 14, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.course?.title}</div>
                    <div style={{ fontSize: 12, color: "var(--text3)", marginTop: 2 }}>{item.batch.name}</div>
                    <div style={{ marginTop: 6 }}>
                      <div className="progress-bar" style={{ height: 4 }}>
                        <div className="progress-fill" style={{ width: `${item.progress?.progressPercentage || 0}%` }} />
                      </div>
                    </div>
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "var(--accent2)", flexShrink: 0 }}>
                    {item.progress?.progressPercentage || 0}%
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming Classes */}
        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700 }}>Upcoming Classes</h2>
            <Link to="/student/classes" style={{ fontSize: 13, color: "var(--accent2)" }}>View all →</Link>
          </div>
          {data?.upcomingClasses?.length === 0 ? (
            <div className="empty-state" style={{ padding: 30 }}>
              <p>No upcoming classes</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {data?.upcomingClasses?.map((cls) => (
                <div key={cls._id} style={{ padding: "14px", background: "var(--bg3)", borderRadius: "var(--radius-sm)", borderLeft: "3px solid var(--blue)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{cls.title}</div>
                      <div style={{ fontSize: 12, color: "var(--text3)", marginTop: 4 }}>
                        <MdCalendarToday size={11} style={{ marginRight: 4 }} />
                        {format(new Date(cls.date), "MMM dd, yyyy · h:mm a")}
                      </div>
                      <div style={{ fontSize: 12, color: "var(--text3)", marginTop: 2 }}>{cls.batch?.name}</div>
                    </div>
                    <a href={cls.meetingLink} target="_blank" rel="noreferrer" className="btn btn-primary btn-sm"
                      onClick={(e) => e.stopPropagation()}>
                      <MdOpenInNew size={13} /> Join
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
