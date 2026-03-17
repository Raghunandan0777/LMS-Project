import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { quizAPI } from "../../api";
import toast from "react-hot-toast";
import { MdCheckCircle, MdCancel, MdTimer } from "react-icons/md";

export default function QuizAttempt() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null);
  const timerRef = useRef(null);

  useEffect(() => {
    quizAPI.getById(id)
      .then((res) => {
        const q = res.data.quiz;
        setQuiz(q);
        if (q.myAttempt) setResult(q.myAttempt);
        else setTimeLeft(q.duration * 60);
      })
      .catch(() => navigate(-1))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (timeLeft === null || result) return;
    if (timeLeft <= 0) { handleSubmit(); return; }
    timerRef.current = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearTimeout(timerRef.current);
  }, [timeLeft, result]);

  const handleSubmit = async () => {
    if (submitting) return;
    clearTimeout(timerRef.current);
    const formatted = Object.entries(answers).map(([qi, opt]) => ({
      questionIndex: Number(qi), selectedOption: opt,
    }));
    setSubmitting(true);
    try {
      const res = await quizAPI.attempt(id, { answers: formatted });
      setResult(res.data.result);
      toast.success("Quiz submitted!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  if (loading) return <div className="spinner" />;
  if (!quiz) return null;

  if (result) {
    return (
      <div style={{ maxWidth: 600, margin: "0 auto" }}>
        <div className="card" style={{ textAlign: "center", borderColor: result.passed ? "var(--green)" : "var(--red)" }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>{result.passed ? "🎉" : "😔"}</div>
          <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>
            {result.passed ? "Passed!" : "Not Passed"}
          </h2>
          <div style={{ fontSize: 48, fontWeight: 800, color: result.passed ? "var(--green)" : "var(--red)", margin: "20px 0" }}>
            {result.score}/{result.totalMarks || quiz.totalMarks}
          </div>
          <div style={{ fontSize: 15, color: "var(--text2)", marginBottom: 20 }}>
            {result.percentage || Math.round((result.score / (result.totalMarks || quiz.totalMarks)) * 100)}% · Passing: {result.passingMarks || quiz.passingMarks} marks
          </div>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <button className="btn btn-secondary" onClick={() => navigate(-1)}>← Back to Quizzes</button>
          </div>
        </div>
      </div>
    );
  }

  const answeredCount = Object.keys(answers).length;

  return (
    <div style={{ maxWidth: 720, margin: "0 auto" }}>
      {/* Quiz header */}
      <div className="card" style={{ marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 800 }}>{quiz.title}</h1>
          <div style={{ fontSize: 13, color: "var(--text2)", marginTop: 4 }}>
            {quiz.questions?.length} questions · Pass: {quiz.passingMarks}/{quiz.totalMarks} marks
          </div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 20, fontWeight: 800, color: timeLeft < 60 ? "var(--red)" : "var(--accent2)" }}>
            <MdTimer size={20} />
            {formatTime(timeLeft)}
          </div>
          <div style={{ fontSize: 12, color: "var(--text3)" }}>Time Remaining</div>
        </div>
      </div>

      {/* Progress */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "var(--text2)", marginBottom: 6 }}>
          <span>{answeredCount} / {quiz.questions?.length} answered</span>
          <span>{Math.round((answeredCount / quiz.questions?.length) * 100)}%</span>
        </div>
        <div className="progress-bar"><div className="progress-fill" style={{ width: `${(answeredCount / quiz.questions?.length) * 100}%` }} /></div>
      </div>

      {/* Questions */}
      {quiz.questions?.map((q, qi) => (
        <div key={qi} className="card" style={{ marginBottom: 16, borderColor: answers[qi] !== undefined ? "var(--accent)" : "var(--border)" }}>
          <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
            <div style={{ width: 28, height: 28, borderRadius: "50%", background: answers[qi] !== undefined ? "var(--accent-dim)" : "var(--bg4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: answers[qi] !== undefined ? "var(--accent2)" : "var(--text3)", flexShrink: 0 }}>
              {qi + 1}
            </div>
            <div style={{ fontWeight: 600, fontSize: 15, lineHeight: 1.5 }}>{q.question}</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {q.options.map((opt, oi) => (
              <button
                key={oi}
                onClick={() => setAnswers((prev) => ({ ...prev, [qi]: oi }))}
                style={{
                  padding: "12px 16px", borderRadius: "var(--radius-sm)", border: `2px solid ${answers[qi] === oi ? "var(--accent)" : "var(--border)"}`,
                  background: answers[qi] === oi ? "var(--accent-dim)" : "var(--bg3)",
                  color: answers[qi] === oi ? "var(--accent2)" : "var(--text2)",
                  textAlign: "left", fontSize: 14, cursor: "pointer", transition: "all 0.15s", display: "flex", alignItems: "center", gap: 10,
                }}
              >
                <span style={{ width: 22, height: 22, borderRadius: "50%", border: `2px solid ${answers[qi] === oi ? "var(--accent)" : "var(--border2)"}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  {answers[qi] === oi && <span style={{ width: 10, height: 10, borderRadius: "50%", background: "var(--accent)" }} />}
                </span>
                {opt}
              </button>
            ))}
          </div>
          {q.marks > 1 && <div style={{ marginTop: 10, fontSize: 12, color: "var(--text3)" }}>{q.marks} marks</div>}
        </div>
      ))}

      <div style={{ position: "sticky", bottom: 20, display: "flex", justifyContent: "center", marginTop: 24 }}>
        <button
          className="btn btn-primary btn-lg"
          onClick={handleSubmit}
          disabled={submitting || answeredCount === 0}
          style={{ minWidth: 200, boxShadow: "0 4px 20px rgba(108,99,255,0.4)" }}
        >
          {submitting ? "Submitting..." : `Submit Quiz (${answeredCount}/${quiz.questions?.length})`}
        </button>
      </div>
    </div>
  );
}
