import { useState, useEffect } from "react";
import { batchAPI, courseAPI } from "../../api";
import toast from "react-hot-toast";
import { MdAdd, MdPeople, MdCalendarToday, MdDelete, MdEdit } from "react-icons/md";
import { format } from "date-fns";

export default function InstructorBatches() {
  const [batches, setBatches] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);

  const fetch = () => {
    Promise.all([batchAPI.getMy(), courseAPI.getMy()])
      .then(([b, c]) => { setBatches(b.data.batches); setCourses(c.data.courses); })
      .catch(console.error).finally(() => setLoading(false));
  };
  useEffect(() => { fetch(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this batch?")) return;
    try { await batchAPI.update(id, { isActive: false }); toast.success("Batch deactivated"); fetch(); }
    catch { toast.error("Error"); }
  };

  if (loading) return <div className="spinner" />;

  return (
    <div>
      <div className="page-header">
        <div><h1 className="page-title">My Batches</h1><p className="page-subtitle">Manage enrollment batches</p></div>
        <button className="btn btn-primary" onClick={() => { setEditing(null); setShowModal(true); }}>
          <MdAdd size={18} /> New Batch
        </button>
      </div>
      {batches.length === 0 ? (
        <div className="empty-state"><h3>No batches yet</h3>
          <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => setShowModal(true)}>Create Batch</button>
        </div>
      ) : (
        <div className="grid-2">
          {batches.map((b) => (
            <div key={b._id} className="card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                <div>
                  <h3 style={{ fontSize: 17, fontWeight: 700 }}>{b.name}</h3>
                  <p style={{ fontSize: 13, color: "var(--text2)", marginTop: 4 }}>{b.course?.title}</p>
                </div>
                <span className={`badge badge-${b.isActive ? "green" : "red"}`}>{b.isActive ? "Active" : "Inactive"}</span>
              </div>
              <div style={{ fontSize: 13, color: "var(--text3)", display: "flex", flexDirection: "column", gap: 6, marginBottom: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}><MdCalendarToday size={14} />{format(new Date(b.startDate), "MMM dd")} – {format(new Date(b.endDate), "MMM dd, yyyy")}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}><MdPeople size={14} />{b.enrolledStudents?.length}/{b.capacity} enrolled</div>
              </div>
              <div className="progress-bar" style={{ marginBottom: 14 }}>
                <div className="progress-fill" style={{ width: `${((b.enrolledStudents?.length || 0) / b.capacity) * 100}%` }} />
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button className="btn btn-secondary btn-sm" onClick={() => { setEditing(b); setShowModal(true); }}><MdEdit size={14} /> Edit</button>
                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(b._id)}><MdDelete size={14} /></button>
              </div>
              {b.enrolledStudents?.length > 0 && (
                <div style={{ marginTop: 14, borderTop: "1px solid var(--border)", paddingTop: 14 }}>
                  <div style={{ fontSize: 12, color: "var(--text3)", marginBottom: 8, fontWeight: 600, textTransform: "uppercase" }}>Enrolled Students</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {b.enrolledStudents?.slice(0, 6).map((s) => (
                      <div key={s._id} style={{ fontSize: 12, padding: "3px 10px", background: "var(--bg3)", borderRadius: 20, color: "var(--text2)" }}>{s.name}</div>
                    ))}
                    {b.enrolledStudents?.length > 6 && <div style={{ fontSize: 12, padding: "3px 10px", color: "var(--text3)" }}>+{b.enrolledStudents.length - 6} more</div>}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      {showModal && <BatchModal courses={courses} editing={editing} onClose={() => setShowModal(false)} onSaved={fetch} />}
    </div>
  );
}

function BatchModal({ courses, editing, onClose, onSaved }) {
  const [form, setForm] = useState(editing ? {
    name: editing.name, courseId: editing.course?._id || "", startDate: editing.startDate?.slice(0, 10),
    endDate: editing.endDate?.slice(0, 10), capacity: editing.capacity,
  } : { name: "", courseId: "", startDate: "", endDate: "", capacity: 30 });
  const [saving, setSaving] = useState(false);
  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      if (editing) await batchAPI.update(editing._id, form);
      else await batchAPI.create(form);
      toast.success(editing ? "Batch updated" : "Batch created");
      onSaved(); onClose();
    } catch (err) { toast.error(err.response?.data?.message || "Error"); }
    finally { setSaving(false); }
  };
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{editing ? "Edit Batch" : "Create Batch"}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="form-group"><label className="form-label">Batch Name *</label>
            <input className="form-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required placeholder="e.g. Batch Jan 2025" />
          </div>
          <div className="form-group"><label className="form-label">Course *</label>
            <select className="form-input" value={form.courseId} onChange={(e) => setForm({ ...form, courseId: e.target.value })} required>
              <option value="">Select a course</option>
              {courses.map((c) => <option key={c._id} value={c._id}>{c.title}</option>)}
            </select>
          </div>
          <div className="grid-2">
            <div className="form-group"><label className="form-label">Start Date *</label>
              <input type="date" className="form-input" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} required />
            </div>
            <div className="form-group"><label className="form-label">End Date *</label>
              <input type="date" className="form-input" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} required />
            </div>
          </div>
          <div className="form-group"><label className="form-label">Capacity *</label>
            <input type="number" className="form-input" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: Number(e.target.value) })} min="1" required />
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? "Saving..." : editing ? "Update" : "Create Batch"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
