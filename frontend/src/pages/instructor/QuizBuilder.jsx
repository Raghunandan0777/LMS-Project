import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { quizAPI } from "../../api";
import toast from "react-hot-toast";
import { MdAdd, MdDelete, MdSave, MdCheckCircle } from "react-icons/md";

const emptyQuestion = () => ({
  question: "",
  options: ["", "", "", ""],
  correctOption: 0,
  marks: 1,
});

export default function QuizBuilder() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    quizAPI.getById(id)
      .then((res) => {
        const q = res.data.quiz;
        setQuiz(q);
        // Rebuild questions with correctOption (instructor view)
        setQuestions(q.questions?.length ? q.questions.map((q) => ({ ...q })) : [emptyQuestion()]);
      })
      .catch(() => navigate(-1))
      .finally(() => setLoading(false));
  }, [id]);

  const updateQuestion = (qi, field, value) => {
    setQuestions((prev) => prev.map((q, i) => i === qi ? { ...q, [field]: value } : q));
  };

  const updateOption = (qi, oi, value) => {
    setQuestions((prev) => prev.map((q, i) => {
      if (i !== qi) return q;
      const options = [...q.options];
      options[oi] = value;
      return { ...q, options };
    }));
  };

  const addQuestion = () => setQuestions((prev) => [...prev, emptyQuestion()]);

  const removeQuestion = (qi) => {
    if (questions.length === 1) return toast.error("Quiz must have at least one question");
    setQuestions((prev) => prev.filter((_, i) => i !== qi));
  };

  const handleSave = async () => {
    // Validate
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.question.trim()) return toast.error(`Question ${i + 1} is empty`);
      if (q.options.some((o) => !o.trim())) return toast.error(`All options in Question ${i + 1} must be filled`);
    }
    setSaving(true);
    try {
      await quizAPI.update(id, { questions });
      toast.success("Quiz saved!");
      setQuiz((prev) => ({ ...prev, questions }));
    } catch (err) {
      toast.error(err.response?.data?.message || "Error saving quiz");
    } finally {
      setSaving(false);
    }
  };

  const totalMarks = questions.reduce((s, q) => s + (Number(q.marks) || 1), 0);

  if (loading) return <div className="spinner" />;
  if (!quiz) return null;

  return (
    <div style={{ maxWidth: 800, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 28, flexWrap: "wrap" }}>
        <button className="btn btn-secondary btn-sm" onClick={() => navigate(-1)}>← Back</button>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: 20, fontWeight: 800 }}>{quiz.title}</h1>
          <p style={{ fontSize: 13, color: "var(--text2)", marginTop: 4 }}>
            {questions.length} questions · {totalMarks} total marks · Pass: {quiz.passingMarks} marks
          </p>
        </div>
        <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
          <MdSave size={18} /> {saving ? "Saving..." : "Save Quiz"}
        </button>
      </div>

      {/* Questions */}
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {questions.map((q, qi) => (
          <div key={qi} className="card" style={{ borderColor: "var(--border2)", position: "relative" }}>
            {/* Question number badge */}
            <div style={{
              position: "absolute", top: -12, left: 20,
              width: 28, height: 28, borderRadius: "50%",
              background: "var(--accent)", color: "#fff",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 13, fontWeight: 700,
            }}>
              {qi + 1}
            </div>

            <div style={{ display: "flex", gap: 10, marginBottom: 16, marginTop: 8 }}>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">Question *</label>
                <textarea
                  className="form-input"
                  value={q.question}
                  onChange={(e) => updateQuestion(qi, "question", e.target.value)}
                  placeholder="Enter your question here..."
                  style={{ minHeight: 70, resize: "vertical" }}
                />
              </div>
              <div className="form-group" style={{ width: 100 }}>
                <label className="form-label">Marks</label>
                <input
                  type="number"
                  className="form-input"
                  value={q.marks}
                  onChange={(e) => updateQuestion(qi, "marks", Number(e.target.value))}
                  min="1"
                  max="10"
                />
              </div>
            </div>

            {/* Options */}
            <div className="form-group">
              <label className="form-label">Options (click circle to mark correct answer)</label>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {q.options.map((opt, oi) => (
                  <div key={oi} style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <button
                      type="button"
                      onClick={() => updateQuestion(qi, "correctOption", oi)}
                      style={{
                        width: 32, height: 32, borderRadius: "50%", border: `2px solid ${q.correctOption === oi ? "var(--green)" : "var(--border2)"}`,
                        background: q.correctOption === oi ? "var(--green-dim)" : "var(--bg4)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        cursor: "pointer", flexShrink: 0, transition: "all 0.15s",
                        color: q.correctOption === oi ? "var(--green)" : "var(--text3)",
                        fontSize: 16,
                      }}
                    >
                      {q.correctOption === oi ? <MdCheckCircle /> : <span style={{ fontWeight: 700, fontSize: 12 }}>{String.fromCharCode(65 + oi)}</span>}
                    </button>
                    <input
                      className="form-input"
                      style={{ flex: 1, border: q.correctOption === oi ? "1px solid var(--green)" : undefined }}
                      value={opt}
                      onChange={(e) => updateOption(qi, oi, e.target.value)}
                      placeholder={`Option ${String.fromCharCode(65 + oi)}`}
                    />
                  </div>
                ))}
              </div>
              <div style={{ fontSize: 12, color: "var(--green)", marginTop: 6, display: "flex", alignItems: "center", gap: 4 }}>
                <MdCheckCircle size={13} />
                Correct answer: Option {String.fromCharCode(65 + q.correctOption)} — "{q.options[q.correctOption] || "not set"}"
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
              <button className="btn btn-danger btn-sm" onClick={() => removeQuestion(qi)}>
                <MdDelete size={14} /> Remove Question
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add question + save */}
      <div style={{ display: "flex", gap: 12, marginTop: 20, justifyContent: "center" }}>
        <button className="btn btn-secondary" onClick={addQuestion}>
          <MdAdd size={18} /> Add Question
        </button>
        <button className="btn btn-primary btn-lg" onClick={handleSave} disabled={saving}>
          <MdSave size={18} /> {saving ? "Saving..." : `Save Quiz (${questions.length} questions)`}
        </button>
      </div>
    </div>
  );
}
