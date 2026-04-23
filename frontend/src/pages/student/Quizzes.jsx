import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { batchAPI, quizAPI } from "../../api";
import { useAuth } from "../../context/AuthContext";
import { MdQuiz, MdCheckCircle, MdTimer } from "react-icons/md";

export default function StudentQuizzes() {
  const { user } = useAuth();
  const [batches, setBatches] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBatch, setSelectedBatch] = useState(() => {
    const saved = localStorage.getItem("studentQuizzes_selectedBatch");
    return saved || "";
  });

  // Save selected batch to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("studentQuizzes_selectedBatch", selectedBatch);
  }, [selectedBatch]);

  useEffect(() => {
    batchAPI.getAll().then((res) => {
      const enrolled = res.data.batches.filter((b) =>
        b.enrolledStudents?.includes(user._id),
      );
      setBatches(enrolled);
      // If there's no saved selection or the saved batch is not in the list, select the first one
      const saved = localStorage.getItem("studentQuizzes_selectedBatch");
      const batchExists = enrolled.some((b) => b._id === saved);
      if (enrolled.length > 0 && (!saved || !batchExists)) {
        setSelectedBatch(enrolled[0]._id);
      }
    });
  }, []);

  useEffect(() => {
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
  }, [selectedBatch]);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Quizzes & Tests</h1>
          <p className="page-subtitle">Test your knowledge</p>
        </div>
        {batches.length > 0 && (
          <select
            className="form-input"
            style={{ width: 220 }}
            value={selectedBatch}
            onChange={(e) => setSelectedBatch(e.target.value)}
          >
            {batches.map((b) => (
              <option key={b._id} value={b._id}>
                {b.name}
              </option>
            ))}
          </select>
        )}
      </div>

      {loading ? (
        <div className="spinner" />
      ) : quizzes.length === 0 ? (
        <div className="empty-state">
          <MdQuiz size={50} />
          <h3>No quizzes yet</h3>
          <p>Your instructor hasn't created any quizzes</p>
        </div>
      ) : (
        <div className="grid-2">
          {quizzes.map((quiz) => (
            <div key={quiz._id} className="card">
              <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 8 }}>
                {quiz.title}
              </h3>
              {quiz.description && (
                <p
                  style={{
                    fontSize: 14,
                    color: "var(--text2)",
                    marginBottom: 12,
                  }}
                >
                  {quiz.description}
                </p>
              )}
              <div
                style={{
                  display: "flex",
                  gap: 12,
                  flexWrap: "wrap",
                  fontSize: 13,
                  color: "var(--text3)",
                  marginBottom: 16,
                }}
              >
                <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <MdQuiz size={14} />
                  {quiz.questions?.length || 0} Questions
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <MdTimer size={14} />
                  {quiz.duration} min
                </span>
                <span>
                  Pass: {quiz.passingMarks}/{quiz.totalMarks}
                </span>
              </div>
              <Link
                to={`/student/quizzes/${quiz._id}/attempt`}
                className="btn btn-primary btn-sm w-full"
                style={{ textAlign: "center" }}
              >
                Start Quiz →
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
