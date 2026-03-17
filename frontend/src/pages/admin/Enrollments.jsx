import { useState, useEffect } from "react";
import { adminAPI } from "../../api";
import { MdPeople, MdCalendarToday } from "react-icons/md";
import { format } from "date-fns";

export default function AdminEnrollments() {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAPI.getEnrollments()
      .then((res) => setBatches(res.data.batches))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const totalEnrollments = batches.reduce((s, b) => s + (b.enrolledStudents?.length || 0), 0);

  return (
    <div>
      <div className="page-header">
        <div><h1 className="page-title">Enrollments</h1><p className="page-subtitle">{totalEnrollments} total enrollments across {batches.length} batches</p></div>
      </div>

      {loading ? <div className="spinner" /> : batches.length === 0 ? (
        <div className="empty-state"><h3>No enrollments yet</h3></div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {batches.map((b) => (
            <div key={b._id} className="card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12, marginBottom: 16 }}>
                <div>
                  <h3 style={{ fontSize: 17, fontWeight: 700 }}>{b.name}</h3>
                  <div style={{ fontSize: 13, color: "var(--text2)", marginTop: 4, display: "flex", gap: 16, flexWrap: "wrap" }}>
                    <span>📚 {b.course?.title}</span>
                    <span style={{ display: "flex", alignItems: "center", gap: 6 }}><MdPeople size={13} /> Instructor: {b.instructor?.name}</span>
                    <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <MdCalendarToday size={13} />
                      {format(new Date(b.startDate), "MMM dd")} – {format(new Date(b.endDate), "MMM dd, yyyy")}
                    </span>
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 22, fontWeight: 800, color: "var(--accent2)" }}>{b.enrolledStudents?.length}</div>
                  <div style={{ fontSize: 12, color: "var(--text3)" }}>/ {b.capacity} enrolled</div>
                </div>
              </div>
              <div className="progress-bar" style={{ marginBottom: 14 }}>
                <div className="progress-fill" style={{ width: `${((b.enrolledStudents?.length || 0) / b.capacity) * 100}%` }} />
              </div>
              {b.enrolledStudents?.length > 0 ? (
                <div>
                  <div style={{ fontSize: 12, color: "var(--text3)", marginBottom: 8, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Enrolled Students</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {b.enrolledStudents.map((s) => (
                      <div key={s._id} style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 10px", background: "var(--bg3)", borderRadius: 20, fontSize: 13 }}>
                        <div className="user-avatar" style={{ width: 20, height: 20, fontSize: 9 }}>
                          {s.name?.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                        </div>
                        {s.name}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p style={{ fontSize: 13, color: "var(--text3)" }}>No students enrolled yet</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
