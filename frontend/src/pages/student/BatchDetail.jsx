import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { batchAPI, classAPI, lessonAPI, studentAPI } from "../../api";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";
import { MdPlayCircle, MdPictureAsPdf, MdArticle, MdExpandMore, MdExpandLess, MdOpenInNew, MdCheckCircle, MdCalendarToday } from "react-icons/md";
import { format } from "date-fns";

export default function BatchDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [batch, setBatch] = useState(null);
  const [classes, setClasses] = useState([]);
  const [progress, setProgress] = useState(null);
  const [expanded, setExpanded] = useState({});
  const [activeTab, setActiveTab] = useState("curriculum");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      batchAPI.getById(id),
      classAPI.getByBatch(id),
    ]).then(([batchRes, classRes]) => {
      setBatch(batchRes.data.batch);
      setClasses(classRes.data.classes);
      if (batchRes.data.batch?.course?._id) {
        studentAPI.getProgress(batchRes.data.batch.course._id)
          .then((r) => setProgress(r.data.progress)).catch(() => {});
      }
    }).catch(() => navigate("/student/batches"))
      .finally(() => setLoading(false));
  }, [id]);

  const toggle = (modId) => setExpanded((p) => ({ ...p, [modId]: !p[modId] }));

  const isCompleted = (lessonId) =>
    progress?.completedLessons?.some((l) => l._id === lessonId || l === lessonId);

  const markComplete = async (lessonId) => {
    try {
      await lessonAPI.markComplete(lessonId, { courseId: batch.course._id, batchId: id });
      const updated = await studentAPI.getProgress(batch.course._id);
      setProgress(updated.data.progress);
      toast.success("Lesson marked complete!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Error");
    }
  };

  const lessonIcon = (type) => type === "video" ? <MdPlayCircle /> : type === "pdf" ? <MdPictureAsPdf /> : <MdArticle />;

  if (loading) return <div className="spinner" />;
  if (!batch) return null;

  const totalLessons = batch.course?.modules?.reduce((s, m) => s + (m.lessons?.length || 0), 0) || 0;
  const completedCount = progress?.completedLessons?.length || 0;

  return (
    <div>
      <button className="btn btn-secondary btn-sm" style={{ marginBottom: 24 }} onClick={() => navigate(-1)}>← Back</button>

      {/* Header */}
      <div className="card" style={{ marginBottom: 28, borderColor: "var(--accent)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800 }}>{batch.name}</h1>
            <p style={{ color: "var(--text2)", marginTop: 4 }}>{batch.course?.title}</p>
            <div style={{ display: "flex", gap: 16, marginTop: 12, fontSize: 13, color: "var(--text3)", flexWrap: "wrap" }}>
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}><MdCalendarToday size={14} />{format(new Date(batch.startDate), "MMM dd")} – {format(new Date(batch.endDate), "MMM dd, yyyy")}</span>
              <span>👨‍🏫 {batch.instructor?.name}</span>
              <span>👥 {batch.enrolledStudents?.length} students</span>
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 28, fontWeight: 800, color: "var(--accent2)" }}>{progress?.progressPercentage || 0}%</div>
            <div style={{ fontSize: 13, color: "var(--text2)" }}>Complete</div>
            <div style={{ marginTop: 8, width: 120 }}>
              <div className="progress-bar"><div className="progress-fill" style={{ width: `${progress?.progressPercentage || 0}%` }} /></div>
            </div>
            <div style={{ fontSize: 12, color: "var(--text3)", marginTop: 4 }}>{completedCount}/{totalLessons} lessons</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        {["curriculum", "classes", "assignments", "quizzes"].map((tab) => (
          <button key={tab} className={`tab${activeTab === tab ? " active" : ""}`} onClick={() => setActiveTab(tab)}>
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Curriculum */}
      {activeTab === "curriculum" && (
        <div>
          {!batch.course?.modules?.length ? (
            <div className="empty-state"><h3>No curriculum yet</h3></div>
          ) : (
            batch.course.modules.map((mod) => (
              <div className="module-item" key={mod._id}>
                <div className="module-header" onClick={() => toggle(mod._id)}>
                  <div>
                    <span style={{ fontWeight: 700 }}>{mod.title}</span>
                    <span style={{ marginLeft: 12, fontSize: 13, color: "var(--text3)" }}>{mod.lessons?.length || 0} lessons</span>
                  </div>
                  {expanded[mod._id] ? <MdExpandLess size={20} /> : <MdExpandMore size={20} />}
                </div>
                {expanded[mod._id] && mod.lessons?.map((lesson) => {
                  const done = isCompleted(lesson._id);
                  return (
                    <div className="lesson-item" key={lesson._id} style={{ justifyContent: "space-between" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div className={`lesson-icon lesson-${lesson.type}`}>{lessonIcon(lesson.type)}</div>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: done ? 500 : 400, color: done ? "var(--text3)" : "var(--text)", textDecoration: done ? "line-through" : "none" }}>
                            {lesson.title}
                          </div>
                          {lesson.duration > 0 && <div style={{ fontSize: 12, color: "var(--text3)" }}>{lesson.duration} min</div>}
                        </div>
                      </div>
                      {done ? (
                        <span style={{ color: "var(--green)", fontSize: 20 }}><MdCheckCircle /></span>
                      ) : (
                        <button className="btn btn-success btn-sm" onClick={() => markComplete(lesson._id)}>
                          Mark Done
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            ))
          )}
        </div>
      )}

      {/* Classes */}
      {activeTab === "classes" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {classes.length === 0 ? (
            <div className="empty-state"><h3>No classes scheduled</h3></div>
          ) : (
            classes.map((cls) => (
              <div key={cls._id} className="card-sm" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 16 }}>{cls.title}</div>
                  <div style={{ fontSize: 13, color: "var(--text2)", marginTop: 4 }}>{format(new Date(cls.date), "EEEE, MMM dd yyyy · h:mm a")}</div>
                  {cls.description && <div style={{ fontSize: 13, color: "var(--text3)", marginTop: 4 }}>{cls.description}</div>}
                  <div style={{ fontSize: 13, color: "var(--text3)", marginTop: 4 }}>Duration: {cls.duration} min</div>
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <span className={`badge badge-${cls.status === "scheduled" ? "blue" : cls.status === "completed" ? "green" : "red"}`}>{cls.status}</span>
                  {cls.status === "scheduled" && (
                    <a href={cls.meetingLink} target="_blank" rel="noreferrer" className="btn btn-primary btn-sm">
                      <MdOpenInNew size={14} /> Join Class
                    </a>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Assignments link */}
      {activeTab === "assignments" && (
        <div style={{ textAlign: "center", padding: 40 }}>
          <p style={{ color: "var(--text2)", marginBottom: 16 }}>View all assignments for this batch</p>
          <Link to="/student/assignments" className="btn btn-primary">Go to Assignments</Link>
        </div>
      )}

      {/* Quizzes link */}
      {activeTab === "quizzes" && (
        <div style={{ textAlign: "center", padding: 40 }}>
          <p style={{ color: "var(--text2)", marginBottom: 16 }}>View all quizzes for this batch</p>
          <Link to="/student/quizzes" className="btn btn-primary">Go to Quizzes</Link>
        </div>
      )}
    </div>
  );
}
