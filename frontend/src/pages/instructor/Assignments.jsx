import { useState, useEffect } from "react";
import { assignmentAPI, batchAPI } from "../../api";
import toast from "react-hot-toast";
import { MdAdd, MdDelete, MdEdit, MdGrade, MdDownload } from "react-icons/md";
import { format, isPast } from "date-fns";

export default function InstructorAssignments() {
  const [assignments, setAssignments] = useState([]);
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState(() => {
    const saved = localStorage.getItem("instructorAssignments_selectedBatch");
    return saved || "";
  });
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [gradeModal, setGradeModal] = useState(null);
  const [editing, setEditing] = useState(null);

  // Save selected batch to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("instructorAssignments_selectedBatch", selectedBatch);
  }, [selectedBatch]);

  useEffect(() => {
    batchAPI.getMy().then((res) => {
      setBatches(res.data.batches);
      const saved = localStorage.getItem("instructorAssignments_selectedBatch");
      const batchExists = res.data.batches.some((b) => b._id === saved);
      if (res.data.batches.length > 0 && (!saved || !batchExists)) {
        setSelectedBatch(res.data.batches[0]._id);
      }
    });
  }, []);

  const fetch = () => {
    if (!selectedBatch) {
      setLoading(false);
      return;
    }
    setLoading(true);
    assignmentAPI
      .getByBatch(selectedBatch)
      .then((res) => setAssignments(res.data.assignments))
      .catch(console.error)
      .finally(() => setLoading(false));
  };
  useEffect(() => {
    fetch();
  }, [selectedBatch]);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this assignment?")) return;
    try {
      await assignmentAPI.delete(id);
      toast.success("Deleted");
      fetch();
    } catch {
      toast.error("Error");
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Assignments</h1>
          <p className="page-subtitle">Create and grade student work</p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <select
            className="form-input"
            style={{ width: 200 }}
            value={selectedBatch}
            onChange={(e) => setSelectedBatch(e.target.value)}
          >
            {batches.map((b) => (
              <option key={b._id} value={b._id}>
                {b.name}
              </option>
            ))}
          </select>
          <button
            className="btn btn-primary"
            onClick={() => {
              setEditing(null);
              setShowModal(true);
            }}
          >
            <MdAdd size={18} /> New Assignment
          </button>
        </div>
      </div>

      {loading ? (
        <div className="spinner" />
      ) : assignments.length === 0 ? (
        <div className="empty-state">
          <h3>No assignments in this batch</h3>
          <button
            className="btn btn-primary"
            style={{ marginTop: 16 }}
            onClick={() => setShowModal(true)}
          >
            Create Assignment
          </button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {assignments.map((a) => (
            <div key={a._id} className="card">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: 12,
                }}
              >
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: 17, fontWeight: 700 }}>{a.title}</h3>
                  <p
                    style={{
                      fontSize: 14,
                      color: "var(--text2)",
                      marginTop: 6,
                    }}
                  >
                    {a.description}
                  </p>
                  <div
                    style={{
                      fontSize: 13,
                      color: "var(--text3)",
                      marginTop: 10,
                      display: "flex",
                      gap: 16,
                      flexWrap: "wrap",
                    }}
                  >
                    <span>
                      📅 Deadline:{" "}
                      <span
                        style={{
                          color: isPast(new Date(a.deadline))
                            ? "var(--red)"
                            : "var(--text2)",
                          fontWeight: 600,
                        }}
                      >
                        {format(new Date(a.deadline), "MMM dd, yyyy · h:mm a")}
                      </span>
                    </span>
                    <span>📊 Total Marks: {a.totalMarks}</span>
                    <span>📝 Submissions: {a.submissions?.length || 0}</span>
                  </div>
                </div>
                <div
                  style={{
                    display: "flex",
                    gap: 8,
                    flexWrap: "wrap",
                    alignItems: "flex-start",
                  }}
                >
                  {a.instructionFile && (
                    <a
                      href={a.instructionFile}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-secondary btn-sm"
                    >
                      <MdDownload size={14} />
                    </a>
                  )}
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => {
                      setEditing(a);
                      setShowModal(true);
                    }}
                  >
                    <MdEdit size={14} />
                  </button>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => setGradeModal(a)}
                  >
                    <MdGrade size={14} /> Grade ({a.submissions?.length || 0})
                  </button>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleDelete(a._id)}
                  >
                    <MdDelete size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <AssignmentModal
          batches={batches}
          selectedBatch={selectedBatch}
          editing={editing}
          onClose={() => setShowModal(false)}
          onSaved={fetch}
        />
      )}
      {gradeModal && (
        <GradeModal
          assignment={gradeModal}
          onClose={() => setGradeModal(null)}
          onSaved={fetch}
        />
      )}
    </div>
  );
}

function AssignmentModal({
  batches,
  selectedBatch,
  editing,
  onClose,
  onSaved,
}) {
  const [form, setForm] = useState(
    editing
      ? {
          title: editing.title,
          description: editing.description,
          batchId: editing.batch,
          deadline: editing.deadline?.slice(0, 16),
          totalMarks: editing.totalMarks,
        }
      : {
          title: "",
          description: "",
          batchId: selectedBatch,
          deadline: "",
          totalMarks: 100,
        },
  );
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    if (file) fd.append("instructionFile", file);
    try {
      if (editing) await assignmentAPI.update(editing._id, fd);
      else await assignmentAPI.create(fd);
      toast.success(editing ? "Updated" : "Assignment created");
      onSaved();
      onClose();
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
          <h2 className="modal-title">
            {editing ? "Edit Assignment" : "New Assignment"}
          </h2>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>
        <form
          onSubmit={handleSave}
          style={{ display: "flex", flexDirection: "column", gap: 16 }}
        >
          <div className="form-group">
            <label className="form-label">Title *</label>
            <input
              className="form-input"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Description *</label>
            <textarea
              className="form-input"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Batch</label>
            <select
              className="form-input"
              value={form.batchId}
              onChange={(e) => setForm({ ...form, batchId: e.target.value })}
            >
              {batches.map((b) => (
                <option key={b._id} value={b._id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Deadline *</label>
              <input
                type="datetime-local"
                className="form-input"
                value={form.deadline}
                onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Total Marks</label>
              <input
                type="number"
                className="form-input"
                value={form.totalMarks}
                onChange={(e) =>
                  setForm({ ...form, totalMarks: Number(e.target.value) })
                }
                min="1"
              />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Instruction File (optional)</label>
            <input
              type="file"
              className="form-input"
              accept=".pdf,.doc,.docx"
              onChange={(e) => setFile(e.target.files[0])}
            />
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? "Saving..." : editing ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function GradeModal({ assignment, onClose, onSaved }) {
  const [grades, setGrades] = useState({});
  const [feedback, setFeedback] = useState({});
  const [saving, setSaving] = useState(null);

  const handleGrade = async (subId) => {
    if (!grades[subId] && grades[subId] !== 0)
      return toast.error("Enter a grade");
    setSaving(subId);
    try {
      await assignmentAPI.grade(assignment._id, subId, {
        grade: Number(grades[subId]),
        feedback: feedback[subId] || "",
      });
      toast.success("Graded!");
      onSaved();
    } catch {
      toast.error("Error");
    } finally {
      setSaving(null);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal"
        style={{ maxWidth: 700 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2 className="modal-title">
            Grade Submissions – {assignment.title}
          </h2>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>
        {assignment.submissions?.length === 0 ? (
          <div className="empty-state" style={{ padding: 30 }}>
            <p>No submissions yet</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {assignment.submissions?.map((s) => (
              <div
                key={s._id}
                style={{
                  padding: 16,
                  background: "var(--bg3)",
                  borderRadius: "var(--radius-sm)",
                  border: `1px solid ${s.status === "graded" ? "var(--green)" : "var(--border)"}`,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 10,
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600 }}>{s.student?.name}</div>
                    <div style={{ fontSize: 13, color: "var(--text3)" }}>
                      {s.student?.email} · {s.status}
                    </div>
                  </div>
                  <a
                    href={s.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-secondary btn-sm"
                  >
                    <MdDownload size={14} /> View
                  </a>
                </div>
                {s.status === "graded" ? (
                  <div style={{ fontSize: 14, color: "var(--green)" }}>
                    Grade: {s.grade}/{assignment.totalMarks} · {s.feedback}
                  </div>
                ) : (
                  <div
                    style={{
                      display: "flex",
                      gap: 10,
                      alignItems: "center",
                      flexWrap: "wrap",
                    }}
                  >
                    <input
                      type="number"
                      className="form-input"
                      style={{ width: 100 }}
                      placeholder="Grade"
                      min="0"
                      max={assignment.totalMarks}
                      value={grades[s._id] || ""}
                      onChange={(e) =>
                        setGrades({ ...grades, [s._id]: e.target.value })
                      }
                    />
                    <input
                      className="form-input"
                      style={{ flex: 1 }}
                      placeholder="Feedback (optional)"
                      value={feedback[s._id] || ""}
                      onChange={(e) =>
                        setFeedback({ ...feedback, [s._id]: e.target.value })
                      }
                    />
                    <button
                      className="btn btn-success btn-sm"
                      disabled={saving === s._id}
                      onClick={() => handleGrade(s._id)}
                    >
                      {saving === s._id ? "..." : "Grade"}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
