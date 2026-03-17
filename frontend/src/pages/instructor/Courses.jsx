import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { courseAPI } from "../../api";
import toast from "react-hot-toast";
import { MdAdd, MdEdit, MdDelete, MdPublish, MdVisibility } from "react-icons/md";

export default function InstructorCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const navigate = useNavigate();

  const fetch = () => {
    courseAPI.getMy().then((res) => setCourses(res.data.courses)).catch(console.error).finally(() => setLoading(false));
  };
  useEffect(() => { fetch(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this course?")) return;
    try { await courseAPI.delete(id); toast.success("Course deleted"); fetch(); }
    catch (err) { toast.error(err.response?.data?.message || "Error"); }
  };

  const handleTogglePublish = async (id) => {
    try { await courseAPI.togglePublish(id); toast.success("Updated"); fetch(); }
    catch (err) { toast.error("Error"); }
  };

  return (
    <div>
      <div className="page-header">
        <div><h1 className="page-title">My Courses</h1><p className="page-subtitle">Create and manage your courses</p></div>
        <button className="btn btn-primary" onClick={() => { setEditing(null); setShowModal(true); }}>
          <MdAdd size={18} /> New Course
        </button>
      </div>

      {loading ? <div className="spinner" /> : courses.length === 0 ? (
        <div className="empty-state"><MdAdd size={50} /><h3>No courses yet</h3><p>Create your first course to get started</p>
          <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => setShowModal(true)}><MdAdd /> Create Course</button>
        </div>
      ) : (
        <div className="grid-3">
          {courses.map((c) => (
            <div key={c._id} className="course-card">
              {c.thumbnail
                ? <img src={c.thumbnail} alt="" className="course-thumbnail" />
                : <div className="course-thumbnail-placeholder">📚</div>
              }
              <div className="course-body">
                <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
                  <span className={`badge badge-${c.isPublished ? "green" : "amber"}`}>{c.isPublished ? "Published" : "Draft"}</span>
                  <span className="badge badge-blue">{c.level}</span>
                </div>
                <div className="course-title">{c.title}</div>
                <div style={{ fontSize: 13, color: "var(--text2)", marginTop: 6, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                  {c.description}
                </div>
                <div className="course-meta">
                  <span>📦 {c.modules?.length || 0} modules</span>
                  <span>💰 {c.price === 0 ? "Free" : `₹${c.price}`}</span>
                </div>
                <div style={{ display: "flex", gap: 8, marginTop: 14, flexWrap: "wrap" }}>
                  <Link to={`/instructor/courses/${c._id}/builder`} className="btn btn-primary btn-sm" style={{ flex: 1 }}>
                    <MdEdit size={14} /> Edit
                  </Link>
                  <button className={`btn btn-sm ${c.isPublished ? "btn-secondary" : "btn-success"}`} onClick={() => handleTogglePublish(c._id)}>
                    <MdPublish size={14} /> {c.isPublished ? "Unpublish" : "Publish"}
                  </button>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(c._id)}>
                    <MdDelete size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && <CourseModal onClose={() => setShowModal(false)} onSaved={fetch} editing={editing} />}
    </div>
  );
}

function CourseModal({ onClose, onSaved, editing }) {
  const [form, setForm] = useState(editing || { title: "", description: "", price: 0, duration: "", category: "General", level: "Beginner" });
  const [thumbnail, setThumbnail] = useState(null);
  const [saving, setSaving] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    if (thumbnail) fd.append("thumbnail", thumbnail);
    try {
      if (editing) await courseAPI.update(editing._id, fd);
      else await courseAPI.create(fd);
      toast.success(editing ? "Course updated" : "Course created");
      onSaved(); onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{editing ? "Edit Course" : "Create New Course"}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="form-group">
            <label className="form-label">Title *</label>
            <input className="form-input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required placeholder="e.g. React for Beginners" />
          </div>
          <div className="form-group">
            <label className="form-label">Description *</label>
            <textarea className="form-input" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required placeholder="What will students learn?" />
          </div>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Category</label>
              <input className="form-input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="e.g. Web Development" />
            </div>
            <div className="form-group">
              <label className="form-label">Level</label>
              <select className="form-input" value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })}>
                <option>Beginner</option><option>Intermediate</option><option>Advanced</option>
              </select>
            </div>
          </div>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Price (₹)</label>
              <input type="number" className="form-input" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} min="0" />
            </div>
            <div className="form-group">
              <label className="form-label">Duration</label>
              <input className="form-input" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} placeholder="e.g. 12 weeks" />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Thumbnail</label>
            <input type="file" className="form-input" accept="image/*" onChange={(e) => setThumbnail(e.target.files[0])} />
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? "Saving..." : editing ? "Update Course" : "Create Course"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
