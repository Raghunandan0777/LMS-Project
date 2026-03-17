import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { courseAPI, lessonAPI } from "../../api";
import toast from "react-hot-toast";
import { MdAdd, MdDelete, MdEdit, MdExpandMore, MdExpandLess, MdDragIndicator, MdPlayCircle, MdPictureAsPdf, MdArticle, MdSave } from "react-icons/md";

export default function CourseBuilder() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState({});
  const [showModModal, setShowModModal] = useState(false);
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [activeModule, setActiveModule] = useState(null);
  const [editingModule, setEditingModule] = useState(null);
  const [editingLesson, setEditingLesson] = useState(null);

  const fetch = () => {
    courseAPI.getById(id).then((res) => { setCourse(res.data.course); setLoading(false); }).catch(() => navigate(-1));
  };
  useEffect(() => { fetch(); }, [id]);

  const toggle = (modId) => setExpanded((p) => ({ ...p, [modId]: !p[modId] }));

  const handleDeleteModule = async (modId) => {
    if (!window.confirm("Delete this module and all its lessons?")) return;
    try { await lessonAPI.deleteModule(modId); toast.success("Module deleted"); fetch(); }
    catch (err) { toast.error("Error deleting module"); }
  };

  const handleDeleteLesson = async (lessonId) => {
    if (!window.confirm("Delete this lesson?")) return;
    try { await lessonAPI.deleteLesson(lessonId); toast.success("Lesson deleted"); fetch(); }
    catch (err) { toast.error("Error deleting lesson"); }
  };

  const lessonIcon = (type) => type === "video" ? <MdPlayCircle /> : type === "pdf" ? <MdPictureAsPdf /> : <MdArticle />;

  if (loading) return <div className="spinner" />;
  if (!course) return null;

  return (
    <div>
      <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 28, flexWrap: "wrap" }}>
        <button className="btn btn-secondary btn-sm" onClick={() => navigate(-1)}>← Back</button>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 800 }}>{course.title}</h1>
          <p style={{ fontSize: 13, color: "var(--text2)" }}>Course Builder · {course.modules?.length || 0} modules</p>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          <span className={`badge badge-${course.isPublished ? "green" : "amber"}`}>{course.isPublished ? "Published" : "Draft"}</span>
          <button className="btn btn-primary" onClick={() => { setEditingModule(null); setShowModModal(true); }}>
            <MdAdd size={16} /> Add Module
          </button>
        </div>
      </div>

      {course.modules?.length === 0 ? (
        <div className="empty-state">
          <MdAdd size={50} />
          <h3>No modules yet</h3>
          <p>Start building your course curriculum by adding modules</p>
          <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => setShowModModal(true)}><MdAdd /> Add First Module</button>
        </div>
      ) : (
        course.modules?.map((mod, mi) => (
          <div className="module-item" key={mod._id} style={{ marginBottom: 14 }}>
            <div className="module-header">
              <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1 }} onClick={() => toggle(mod._id)}>
                <MdDragIndicator style={{ color: "var(--text3)" }} />
                <div>
                  <span style={{ fontWeight: 700 }}>Module {mi + 1}: {mod.title}</span>
                  <span style={{ marginLeft: 12, fontSize: 13, color: "var(--text3)" }}>{mod.lessons?.length || 0} lessons</span>
                </div>
                <span style={{ marginLeft: 8 }}>{expanded[mod._id] ? <MdExpandLess size={20} /> : <MdExpandMore size={20} />}</span>
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <button className="btn btn-secondary btn-sm" onClick={() => { setEditingModule(mod); setShowModModal(true); }}>
                  <MdEdit size={14} />
                </button>
                <button className="btn btn-danger btn-sm" onClick={() => handleDeleteModule(mod._id)}>
                  <MdDelete size={14} />
                </button>
              </div>
            </div>

            {expanded[mod._id] && (
              <div>
                {mod.lessons?.map((lesson) => (
                  <div className="lesson-item" key={lesson._id} style={{ justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div className={`lesson-icon lesson-${lesson.type}`}>{lessonIcon(lesson.type)}</div>
                      <div>
                        <div style={{ fontWeight: 500, fontSize: 14 }}>{lesson.title}</div>
                        <div style={{ fontSize: 12, color: "var(--text3)" }}>{lesson.type}{lesson.duration ? ` · ${lesson.duration} min` : ""}{lesson.isPreview ? " · Preview" : ""}</div>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button className="btn btn-secondary btn-sm" onClick={() => { setEditingLesson(lesson); setActiveModule(mod._id); setShowLessonModal(true); }}>
                        <MdEdit size={13} />
                      </button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDeleteLesson(lesson._id)}>
                        <MdDelete size={13} />
                      </button>
                    </div>
                  </div>
                ))}
                <div style={{ padding: "12px 16px 14px 36px" }}>
                  <button className="btn btn-secondary btn-sm" onClick={() => { setActiveModule(mod._id); setEditingLesson(null); setShowLessonModal(true); }}>
                    <MdAdd size={14} /> Add Lesson
                  </button>
                </div>
              </div>
            )}
          </div>
        ))
      )}

      {showModModal && (
        <ModuleModal
          courseId={id}
          editing={editingModule}
          onClose={() => setShowModModal(false)}
          onSaved={fetch}
        />
      )}
      {showLessonModal && (
        <LessonModal
          courseId={id}
          moduleId={activeModule}
          editing={editingLesson}
          onClose={() => setShowLessonModal(false)}
          onSaved={fetch}
        />
      )}
    </div>
  );
}

function ModuleModal({ courseId, editing, onClose, onSaved }) {
  const [form, setForm] = useState(editing || { title: "", description: "", order: 0 });
  const [saving, setSaving] = useState(false);
  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      if (editing) await lessonAPI.updateModule(editing._id, form);
      else await lessonAPI.createModule({ ...form, courseId });
      toast.success(editing ? "Module updated" : "Module added");
      onSaved(); onClose();
    } catch (err) { toast.error(err.response?.data?.message || "Error"); }
    finally { setSaving(false); }
  };
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{editing ? "Edit Module" : "Add Module"}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="form-group"><label className="form-label">Module Title *</label>
            <input className="form-input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required placeholder="e.g. Introduction to React" />
          </div>
          <div className="form-group"><label className="form-label">Description</label>
            <textarea className="form-input" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Brief overview..." style={{ minHeight: 80 }} />
          </div>
          <div className="form-group"><label className="form-label">Order</label>
            <input type="number" className="form-input" value={form.order} onChange={(e) => setForm({ ...form, order: Number(e.target.value) })} min="0" />
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? "Saving..." : editing ? "Update" : "Add Module"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function LessonModal({ courseId, moduleId, editing, onClose, onSaved }) {
  const [form, setForm] = useState(editing || { title: "", type: "text", content: "", duration: 0, order: 0, isPreview: false });
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true);
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    if (!editing) { fd.append("moduleId", moduleId); fd.append("courseId", courseId); }
    if (file) fd.append("content", file);
    try {
      if (editing) await lessonAPI.updateLesson(editing._id, fd);
      else await lessonAPI.createLesson(fd);
      toast.success(editing ? "Lesson updated" : "Lesson added");
      onSaved(); onClose();
    } catch (err) { toast.error(err.response?.data?.message || "Error"); }
    finally { setSaving(false); }
  };
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{editing ? "Edit Lesson" : "Add Lesson"}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="form-group"><label className="form-label">Lesson Title *</label>
            <input className="form-input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          </div>
          <div className="grid-2">
            <div className="form-group"><label className="form-label">Type</label>
              <select className="form-input" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value, content: "" })}>
                <option value="text">Text</option><option value="video">Video</option><option value="pdf">PDF</option>
              </select>
            </div>
            <div className="form-group"><label className="form-label">Duration (min)</label>
              <input type="number" className="form-input" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} min="0" />
            </div>
          </div>
          {form.type === "text" ? (
            <div className="form-group"><label className="form-label">Content</label>
              <textarea className="form-input" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} placeholder="Lesson text content..." style={{ minHeight: 120 }} />
            </div>
          ) : (
            <div className="form-group">
              <label className="form-label">Upload {form.type === "video" ? "Video" : "PDF"}</label>
              <input type="file" className="form-input" accept={form.type === "video" ? "video/*" : ".pdf"} onChange={(e) => setFile(e.target.files[0])} />
            </div>
          )}
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input type="checkbox" id="preview" checked={form.isPreview} onChange={(e) => setForm({ ...form, isPreview: e.target.checked })} />
            <label htmlFor="preview" style={{ fontSize: 14, color: "var(--text2)", cursor: "pointer" }}>Make available as free preview</label>
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? "Saving..." : editing ? "Update" : "Add Lesson"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
