import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { batchAPI } from "../../api";
import toast from "react-hot-toast";
import { MdPeople, MdCalendarToday, MdCheckCircle } from "react-icons/md";
import { format } from "date-fns";
import { useAuth } from "../../context/AuthContext";

export default function StudentBatches() {
  const { user } = useAuth();
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(null);

  const fetch = () => {
    batchAPI.getAll()
      .then((res) => setBatches(res.data.batches))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetch(); }, []);

  const isEnrolled = (batch) => batch.enrolledStudents?.includes(user._id);
  const isFull = (batch) => batch.enrolledStudents?.length >= batch.capacity;

  const handleEnroll = async (batchId) => {
    setEnrolling(batchId);
    try {
      await batchAPI.enroll(batchId);
      toast.success("Enrolled successfully!");
      fetch();
    } catch (err) {
      toast.error(err.response?.data?.message || "Enrollment failed");
    } finally {
      setEnrolling(null);
    }
  };

  if (loading) return <div className="spinner" />;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Available Batches</h1>
          <p className="page-subtitle">Enroll in a batch to start learning</p>
        </div>
      </div>

      {batches.length === 0 ? (
        <div className="empty-state"><h3>No batches available</h3><p>Check back later for new batches</p></div>
      ) : (
        <div className="grid-3">
          {batches.map((batch) => {
            const enrolled = isEnrolled(batch);
            const full = isFull(batch);
            return (
              <div className="course-card" key={batch._id} style={{ padding: 0 }}>
                <div style={{ padding: 20 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                    <div>
                      <h3 style={{ fontSize: 16, fontWeight: 700 }}>{batch.name}</h3>
                      <p style={{ fontSize: 13, color: "var(--text3)", marginTop: 4 }}>{batch.course?.title}</p>
                    </div>
                    {enrolled && <span className="badge badge-green"><MdCheckCircle size={12} /> Enrolled</span>}
                    {!enrolled && full && <span className="badge badge-red">Full</span>}
                  </div>

                  <div style={{ fontSize: 13, color: "var(--text2)", display: "flex", flexDirection: "column", gap: 6, marginBottom: 16 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <MdCalendarToday size={14} />
                      <span>{format(new Date(batch.startDate), "MMM dd")} – {format(new Date(batch.endDate), "MMM dd, yyyy")}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <MdPeople size={14} />
                      <span>{batch.enrolledStudents?.length || 0} / {batch.capacity} students</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 13 }}>👨‍🏫</span>
                      <span>{batch.instructor?.name}</span>
                    </div>
                  </div>

                  {/* Capacity bar */}
                  <div className="progress-bar" style={{ marginBottom: 16 }}>
                    <div className="progress-fill" style={{
                      width: `${((batch.enrolledStudents?.length || 0) / batch.capacity) * 100}%`,
                      background: full ? "var(--red)" : "linear-gradient(90deg, var(--accent), var(--accent2))"
                    }} />
                  </div>

                  {enrolled ? (
                    <Link to={`/student/batches/${batch._id}`} className="btn btn-secondary w-full">
                      Open Batch →
                    </Link>
                  ) : (
                    <button
                      className="btn btn-primary w-full"
                      disabled={full || enrolling === batch._id}
                      onClick={() => handleEnroll(batch._id)}
                    >
                      {enrolling === batch._id ? "Enrolling..." : full ? "Batch Full" : "Enroll Now"}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
