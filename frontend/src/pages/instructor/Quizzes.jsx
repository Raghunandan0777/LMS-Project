import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { quizAPI, batchAPI } from "../../api";
import toast from "react-hot-toast";
import {
  MdAdd,
  MdDelete,
  MdEdit,
  MdBarChart,
  MdQuiz,
  MdTimer,
} from "react-icons/md";

export default function InstructorQuizzes() {
  const [quizzes, setQuizzes] = useState([]);
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState(() => {
    const saved = localStorage.getItem("instructorQuizzes_selectedBatch");
    return saved || "";
  });
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [resultsModal, setResultsModal] = useState(null);

  // Save selected batch to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("instructorQuizzes_selectedBatch", selectedBatch);
  }, [selectedBatch]);

  useEffect(() => {
    batchAPI.getMy().then((res) => {
      setBatches(res.data.batches);
      const saved = localStorage.getItem("instructorQuizzes_selectedBatch");
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
    quizAPI
      .getByBatch(selectedBatch)
      .then((res) => setQuizzes(res.data.quizzes))
      .catch(console.error)
      .finally(() => setLoading(false));
  };
  useEffect(() => {
    fetch();
  }, [selectedBatch]);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this quiz?")) return;
    try {
      await quizAPI.delete(id);
      toast.success("Quiz deleted");
      fetch();
    } catch {
      toast.error("Error");
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Quizzes & Tests</h1>
          <p className="page-subtitle">Create MCQ tests for students</p>
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
            <MdAdd size={18} /> New Quiz
          </button>
        </div>
      </div>

      {loading ? (
        <div className="spinner" />
      ) : quizzes.length === 0 ? (
        <div className="empty-state">
          <MdQuiz size={50} />
          <h3>No quizzes in this batch</h3>
          <button
            className="btn btn-primary"
            style={{ marginTop: 16 }}
            onClick={() => setShowModal(true)}
          >
            Create Quiz
          </button>
        </div>
      ) : (
        <div className="grid-2">
          {quizzes.map((q) => (
            <div key={q._id} className="card">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: 10,
                }}
              >
                <h3 style={{ fontSize: 16, fontWeight: 700 }}>{q.title}</h3>
                <span
                  className={`badge badge-${q.isActive ? "green" : "amber"}`}
                >
                  {q.isActive ? "Active" : "Inactive"}
                </span>
              </div>
              {q.description && (
                <p
                  style={{
                    fontSize: 13,
                    color: "var(--text2)",
                    marginBottom: 12,
                  }}
                >
                  {q.description}
                </p>
              )}
              <div
                style={{
                  display: "flex",
                  gap: 16,
                  fontSize: 13,
                  color: "var(--text3)",
                  marginBottom: 16,
                  flexWrap: "wrap",
                }}
              >
                <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <MdQuiz size={14} />
                  {q.questions?.length || 0} Questions
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <MdTimer size={14} />
                  {q.duration} min
                </span>
                <span>
                  Pass: {q.passingMarks}/{q.totalMarks}
                </span>
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <Link
                  to={`/instructor/quizzes/${q._id}/builder`}
                  className="btn btn-primary btn-sm"
                >
                  <MdEdit size={14} /> Edit Questions
                </Link>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => setResultsModal(q)}
                >
                  <MdBarChart size={14} /> Results
                </button>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => handleDelete(q._id)}
                >
                  <MdDelete size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <QuizModal
          batches={batches}
          selectedBatch={selectedBatch}
          editing={editing}
          onClose={() => setShowModal(false)}
          onSaved={fetch}
        />
      )}
      {resultsModal && (
        <ResultsModal
          quiz={resultsModal}
          onClose={() => setResultsModal(null)}
        />
      )}
    </div>
  );
}

function QuizModal({ batches, selectedBatch, editing, onClose, onSaved }) {
  const [form, setForm] = useState(
    editing
      ? {
          title: editing.title,
          description: editing.description || "",
          batchId: editing.batch,
          passingMarks: editing.passingMarks,
          duration: editing.duration,
        }
      : {
          title: "",
          description: "",
          batchId: selectedBatch,
          passingMarks: 5,
          duration: 30,
        },
  );
  const [saving, setSaving] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) await quizAPI.update(editing._id, form);
      else await quizAPI.create({ ...form, questions: [] });
      toast.success(
        editing ? "Quiz updated" : "Quiz created — now add questions!",
      );
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
          <h2 className="modal-title">{editing ? "Edit Quiz" : "New Quiz"}</h2>
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
              placeholder="e.g. Week 1 Assessment"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              className="form-input"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              style={{ minHeight: 80 }}
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
              <label className="form-label">Duration (min)</label>
              <input
                type="number"
                className="form-input"
                value={form.duration}
                onChange={(e) =>
                  setForm({ ...form, duration: Number(e.target.value) })
                }
                min="5"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Passing Marks</label>
              <input
                type="number"
                className="form-input"
                value={form.passingMarks}
                onChange={(e) =>
                  setForm({ ...form, passingMarks: Number(e.target.value) })
                }
                min="1"
              />
            </div>
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
              {saving ? "Saving..." : editing ? "Update" : "Create Quiz"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ResultsModal({ quiz, onClose }) {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    quizAPI
      .getResults(quiz._id)
      .then((res) => setResults(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [quiz._id]);

  const passCount = results?.attempts?.filter((a) => a.passed)?.length || 0;
  const avgScore = results?.attempts?.length
    ? Math.round(
        results.attempts.reduce((s, a) => s + a.score, 0) /
          results.attempts.length,
      )
    : 0;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal"
        style={{ maxWidth: 700 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2 className="modal-title">Results — {quiz.title}</h2>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>
        {loading ? (
          <div className="spinner" style={{ margin: "40px auto" }} />
        ) : (
          <>
            <div className="grid-3" style={{ marginBottom: 24, gap: 12 }}>
              {[
                {
                  label: "Attempts",
                  value: results?.attempts?.length || 0,
                  color: "var(--accent2)",
                },
                { label: "Passed", value: passCount, color: "var(--green)" },
                {
                  label: "Avg Score",
                  value: `${avgScore}/${results?.totalMarks}`,
                  color: "var(--amber)",
                },
              ].map((s) => (
                <div
                  key={s.label}
                  style={{
                    textAlign: "center",
                    padding: "14px 10px",
                    background: "var(--bg3)",
                    borderRadius: "var(--radius-sm)",
                  }}
                >
                  <div
                    style={{ fontSize: 22, fontWeight: 800, color: s.color }}
                  >
                    {s.value}
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: "var(--text3)",
                      marginTop: 4,
                    }}
                  >
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
            {results?.attempts?.length === 0 ? (
              <div className="empty-state" style={{ padding: 20 }}>
                <p>No attempts yet</p>
              </div>
            ) : (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Student</th>
                      <th>Score</th>
                      <th>Status</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results?.attempts?.map((a, i) => (
                      <tr key={i}>
                        <td>
                          <div style={{ fontWeight: 600 }}>
                            {a.student?.name}
                          </div>
                          <div style={{ fontSize: 12, color: "var(--text3)" }}>
                            {a.student?.email}
                          </div>
                        </td>
                        <td>
                          <span
                            style={{
                              fontWeight: 700,
                              color: a.passed ? "var(--green)" : "var(--red)",
                            }}
                          >
                            {a.score}/{results?.totalMarks}
                          </span>
                          <span
                            style={{
                              fontSize: 12,
                              color: "var(--text3)",
                              marginLeft: 6,
                            }}
                          >
                            ({Math.round((a.score / results?.totalMarks) * 100)}
                            %)
                          </span>
                        </td>
                        <td>
                          <span
                            className={`badge badge-${a.passed ? "green" : "red"}`}
                          >
                            {a.passed ? "Passed" : "Failed"}
                          </span>
                        </td>
                        <td style={{ fontSize: 13, color: "var(--text3)" }}>
                          {new Date(a.attemptedAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
