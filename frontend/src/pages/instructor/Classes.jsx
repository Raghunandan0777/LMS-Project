import { useState, useEffect } from "react";
import { classAPI, batchAPI } from "../../api";
import toast from "react-hot-toast";
import { MdAdd, MdDelete, MdEdit, MdCalendarToday, MdLink } from "react-icons/md";
import { format } from "date-fns";

export default function InstructorClasses() {
  const [classes, setClasses] = useState([]);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);

  const fetch = () => {
    Promise.all([classAPI.getInstructor(), batchAPI.getMy()])
      .then(([c, b]) => { setClasses(c.data.classes); setBatches(b.data.batches); })
      .catch(console.error).finally(() => setLoading(false));
  };
  useEffect(() => { fetch(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this class?")) return;
    try { await classAPI.delete(id); toast.success("Class deleted"); fetch(); }
    catch { toast.error("Error"); }
  };

  const upcoming = classes.filter((c) => new Date(c.date) >= new Date());
  const past = classes.filter((c) => new Date(c.date) < new Date());

  if (loading) return <div className="spinner" />;

  const ClassCard = ({ cls }) => (
    <div className="card" style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
      <div>
        <h3 style={{ fontSize: 16, fontWeight: 700 }}>{cls.title}</h3>
        <div style={{ fontSize: 13, color: "var(--text2)", marginTop: 6, display: "flex", gap: 16, flexWrap: "wrap" }}>
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}><MdCalendarToday size={13} />{format(new Date(cls.date), "MMM dd, yyyy · h:mm a")}</span>
          <span>⏱ {cls.duration} min</span>
          <span>📚 {cls.batch?.name}</span>
        </div>
        {cls.description && <p style={{ fontSize: 13, color: "var(--text3)", marginTop: 6 }}>{cls.description}</p>}
        <a href={cls.meetingLink} target="_blank" rel="noreferrer" style={{ fontSize: 13, color: "var(--blue)", marginTop: 6, display: "flex", alignItems: "center", gap: 4 }}>
          <MdLink size={14} /> {cls.meetingLink}
        </a>
      </div>
      <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
        <span className={`badge badge-${cls.status === "scheduled" ? "blue" : "green"}`}>{cls.status}</span>
        <button className="btn btn-secondary btn-sm" onClick={() => { setEditing(cls); setShowModal(true); }}><MdEdit size={13} /></button>
        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(cls._id)}><MdDelete size={13} /></button>
      </div>
    </div>
  );

  return (
    <div>
      <div className="page-header">
        <div><h1 className="page-title">Live Classes</h1><p className="page-subtitle">Schedule and manage live sessions</p></div>
        <button className="btn btn-primary" onClick={() => { setEditing(null); setShowModal(true); }}><MdAdd size={18} /> Schedule Class</button>
      </div>
      {upcoming.length > 0 && (
        <div style={{ marginBottom: 28 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 14, color: "var(--accent2)" }}>Upcoming ({upcoming.length})</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {upcoming.map((c) => <ClassCard key={c._id} cls={c} />)}
          </div>
        </div>
      )}
      {past.length > 0 && (
        <div>
          <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 14, color: "var(--text3)" }}>Past Classes</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {past.slice(0, 5).map((c) => <ClassCard key={c._id} cls={c} />)}
          </div>
        </div>
      )}
      {classes.length === 0 && (
        <div className="empty-state"><MdCalendarToday size={50} /><h3>No classes scheduled</h3>
          <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => setShowModal(true)}>Schedule First Class</button>
        </div>
      )}
      {showModal && <ClassModal batches={batches} editing={editing} onClose={() => setShowModal(false)} onSaved={fetch} />}
    </div>
  );
}

function ClassModal({ batches, editing, onClose, onSaved }) {
  const [form, setForm] = useState(editing ? {
    title: editing.title, batchId: editing.batch?._id || editing.batch || "",
    date: editing.date ? new Date(editing.date).toISOString().slice(0, 16) : "",
    duration: editing.duration, meetingLink: editing.meetingLink, description: editing.description || "",
    status: editing.status,
  } : { title: "", batchId: "", date: "", duration: 60, meetingLink: "", description: "", status: "scheduled" });
  const [saving, setSaving] = useState(false);
  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      if (editing) await classAPI.update(editing._id, { ...form });
      else await classAPI.create(form);
      toast.success(editing ? "Class updated" : "Class scheduled");
      onSaved(); onClose();
    } catch (err) { toast.error(err.response?.data?.message || "Error"); }
    finally { setSaving(false); }
  };
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{editing ? "Edit Class" : "Schedule Class"}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="form-group"><label className="form-label">Title *</label>
            <input className="form-input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required placeholder="e.g. Introduction Lecture" />
          </div>
          <div className="form-group"><label className="form-label">Batch *</label>
            <select className="form-input" value={form.batchId} onChange={(e) => setForm({ ...form, batchId: e.target.value })} required>
              <option value="">Select batch</option>
              {batches.map((b) => <option key={b._id} value={b._id}>{b.name}</option>)}
            </select>
          </div>
          <div className="grid-2">
            <div className="form-group"><label className="form-label">Date & Time *</label>
              <input type="datetime-local" className="form-input" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
            </div>
            <div className="form-group"><label className="form-label">Duration (min)</label>
              <input type="number" className="form-input" value={form.duration} onChange={(e) => setForm({ ...form, duration: Number(e.target.value) })} min="15" />
            </div>
          </div>
          <div className="form-group"><label className="form-label">Meeting Link *</label>
            <input className="form-input" value={form.meetingLink} onChange={(e) => setForm({ ...form, meetingLink: e.target.value })} required placeholder="https://meet.google.com/..." />
          </div>
          <div className="form-group"><label className="form-label">Description</label>
            <textarea className="form-input" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} style={{ minHeight: 80 }} />
          </div>
          {editing && (
            <div className="form-group"><label className="form-label">Status</label>
              <select className="form-input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                <option value="scheduled">Scheduled</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option>
              </select>
            </div>
          )}
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? "Saving..." : editing ? "Update" : "Schedule"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
