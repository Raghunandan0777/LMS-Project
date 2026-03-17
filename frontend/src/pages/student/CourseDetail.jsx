import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { courseAPI } from "../../api";
import { MdPlayCircle, MdPictureAsPdf, MdArticle, MdExpandMore, MdExpandLess, MdPerson, MdAccessTime, MdAttachMoney } from "react-icons/md";

export default function CourseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState({});

  useEffect(() => {
    courseAPI.getById(id)
      .then((res) => setCourse(res.data.course))
      .catch(() => navigate("/student/courses"))
      .finally(() => setLoading(false));
  }, [id]);

  const toggle = (modId) => setExpanded((p) => ({ ...p, [modId]: !p[modId] }));

  const lessonIcon = (type) => {
    if (type === "video") return <MdPlayCircle />;
    if (type === "pdf") return <MdPictureAsPdf />;
    return <MdArticle />;
  };
  const lessonClass = (type) => `lesson-icon lesson-${type}`;

  if (loading) return <div className="spinner" />;
  if (!course) return null;

  const totalLessons = course.modules?.reduce((s, m) => s + (m.lessons?.length || 0), 0) || 0;

  return (
    <div>
      <button className="btn btn-secondary btn-sm" style={{ marginBottom: 24 }} onClick={() => navigate(-1)}>← Back</button>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 28, alignItems: "start" }}>
        {/* Left */}
        <div>
          <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
            <span className="badge badge-purple">{course.level}</span>
            <span className="badge badge-blue">{course.category}</span>
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 800, lineHeight: 1.3, marginBottom: 12 }}>{course.title}</h1>
          <div style={{ display: "flex", gap: 20, color: "var(--text2)", fontSize: 14, flexWrap: "wrap", marginBottom: 20 }}>
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}><MdPerson size={16} />{course.instructor?.name}</span>
            {course.duration && <span style={{ display: "flex", alignItems: "center", gap: 6 }}><MdAccessTime size={16} />{course.duration}</span>}
            <span>{totalLessons} lessons</span>
          </div>
          <p style={{ color: "var(--text2)", lineHeight: 1.8, marginBottom: 28 }}>{course.description}</p>

          {/* Curriculum */}
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>Curriculum</h2>
          {course.modules?.length === 0 ? (
            <div className="empty-state"><p>No curriculum added yet</p></div>
          ) : (
            course.modules?.map((mod) => (
              <div className="module-item" key={mod._id}>
                <div className="module-header" onClick={() => toggle(mod._id)}>
                  <div>
                    <span style={{ fontWeight: 600, fontSize: 15 }}>{mod.title}</span>
                    <span style={{ marginLeft: 12, fontSize: 13, color: "var(--text3)" }}>{mod.lessons?.length || 0} lessons</span>
                  </div>
                  {expanded[mod._id] ? <MdExpandLess size={20} /> : <MdExpandMore size={20} />}
                </div>
                {expanded[mod._id] && mod.lessons?.map((lesson) => (
                  <div className="lesson-item" key={lesson._id}>
                    <div className={lessonClass(lesson.type)}>{lessonIcon(lesson.type)}</div>
                    <span style={{ flex: 1 }}>{lesson.title}</span>
                    {lesson.duration > 0 && <span style={{ fontSize: 12, color: "var(--text3)" }}>{lesson.duration} min</span>}
                    {lesson.isPreview && <span className="badge badge-green" style={{ fontSize: 10 }}>Preview</span>}
                  </div>
                ))}
              </div>
            ))
          )}
        </div>

        {/* Right - Enrollment card */}
        <div style={{ position: "sticky", top: 80 }}>
          <div className="card" style={{ borderColor: "var(--accent)" }}>
            {course.thumbnail
              ? <img src={course.thumbnail} alt="" style={{ width: "100%", height: 180, objectFit: "cover", borderRadius: 8, marginBottom: 20 }} />
              : <div style={{ width: "100%", height: 160, background: "var(--bg3)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 48, marginBottom: 20 }}>📚</div>
            }
            <div style={{ fontSize: 28, fontWeight: 800, color: "var(--green)", display: "flex", alignItems: "center", gap: 4, marginBottom: 16 }}>
              <MdAttachMoney size={24} />
              {course.price === 0 ? "Free" : `₹${course.price}`}
            </div>
            <div style={{ fontSize: 13, color: "var(--text2)", marginBottom: 20, display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}><span>Modules</span><span style={{ color: "var(--text)", fontWeight: 600 }}>{course.modules?.length || 0}</span></div>
              <div style={{ display: "flex", justifyContent: "space-between" }}><span>Total Lessons</span><span style={{ color: "var(--text)", fontWeight: 600 }}>{totalLessons}</span></div>
              {course.duration && <div style={{ display: "flex", justifyContent: "space-between" }}><span>Duration</span><span style={{ color: "var(--text)", fontWeight: 600 }}>{course.duration}</span></div>}
              <div style={{ display: "flex", justifyContent: "space-between" }}><span>Level</span><span style={{ color: "var(--text)", fontWeight: 600 }}>{course.level}</span></div>
            </div>
            <button className="btn btn-primary btn-lg w-full" onClick={() => navigate("/student/batches")}>
              View Available Batches
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
