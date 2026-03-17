import { useState, useEffect } from "react";
import { batchAPI, assignmentAPI } from "../../api";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";
import { MdUpload, MdCheckCircle, MdWarning, MdDownload } from "react-icons/md";
import { format, isPast } from "date-fns";

export default function StudentAssignments() {
  const { user } = useAuth();
  const [batches, setBatches] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(null);
  const [selectedBatch, setSelectedBatch] = useState("");

  useEffect(() => {
    batchAPI.getAll().then((res) => {
      const enrolled = res.data.batches.filter((b) => b.enrolledStudents?.includes(user._id));
      setBatches(enrolled);
      if (enrolled.length > 0) setSelectedBatch(enrolled[0]._id);
    }).catch(console.error);
  }, []);

  useEffect(() => {
    if (!selectedBatch) { setLoading(false); return; }
    setLoading(true);
    assignmentAPI.getByBatch(selectedBatch)
      .then((res) => setAssignments(res.data.assignments))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [selectedBatch]);

  const handleSubmit = async (assignmentId, file) => {
    if (!file) return toast.error("Please select a file");
    const fd = new FormData();
    fd.append("submission", file);
    setUploading(assignmentId);
    try {
      await assignmentAPI.submit(assignmentId, fd);
      toast.success("Assignment submitted!");
      const res = await assignmentAPI.getByBatch(selectedBatch);
      setAssignments(res.data.assignments);
    } catch (err) {
      toast.error(err.response?.data?.message || "Submission failed");
    } finally {
      setUploading(null);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div><h1 className="page-title">Assignments</h1><p className="page-subtitle">Submit your work before deadlines</p></div>
        {batches.length > 0 && (
          <select className="form-input" style={{ width: 220 }} value={selectedBatch} onChange={(e) => setSelectedBatch(e.target.value)}>
            {batches.map((b) => <option key={b._id} value={b._id}>{b.name}</option>)}
          </select>
        )}
      </div>

      {loading ? <div className="spinner" /> : assignments.length === 0 ? (
        <div className="empty-state"><MdUpload size={50} /><h3>No assignments yet</h3><p>Your instructor hasn't added assignments for this batch</p></div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {assignments.map((a) => {
            const late = isPast(new Date(a.deadline));
            const submitted = a.submissions?.some((s) => s.student === user._id || s.student?._id === user._id);
            const mySubmission = a.submissions?.find((s) => s.student === user._id || s.student?._id === user._id);
            let fileInput;
            return (
              <div key={a._id} className="card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                      <h3 style={{ fontSize: 17, fontWeight: 700 }}>{a.title}</h3>
                      {submitted && <span className="badge badge-green"><MdCheckCircle size={11} /> Submitted</span>}
                      {!submitted && late && <span className="badge badge-red"><MdWarning size={11} /> Overdue</span>}
                      {!submitted && !late && <span className="badge badge-amber">Pending</span>}
                    </div>
                    <p style={{ color: "var(--text2)", fontSize: 14, marginTop: 8 }}>{a.description}</p>
                    <div style={{ fontSize: 13, color: "var(--text3)", marginTop: 10, display: "flex", gap: 16, flexWrap: "wrap" }}>
                      <span>📅 Deadline: <span style={{ color: late && !submitted ? "var(--red)" : "var(--text2)", fontWeight: 600 }}>{format(new Date(a.deadline), "MMM dd, yyyy · h:mm a")}</span></span>
                      <span>📊 Total Marks: {a.totalMarks}</span>
                    </div>
                    {mySubmission?.grade !== null && mySubmission?.grade !== undefined && (
                      <div style={{ marginTop: 10, padding: "10px 14px", background: "var(--green-dim)", borderRadius: "var(--radius-sm)", display: "inline-block" }}>
                        <span style={{ color: "var(--green)", fontWeight: 700 }}>Grade: {mySubmission.grade}/{a.totalMarks}</span>
                        {mySubmission.feedback && <span style={{ color: "var(--text2)", marginLeft: 12, fontSize: 13 }}>{mySubmission.feedback}</span>}
                      </div>
                    )}
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-end" }}>
                    {a.instructionFile && (
                      <a href={a.instructionFile} target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm">
                        <MdDownload size={14} /> Instructions
                      </a>
                    )}
                    {!submitted && (
                      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        <input
                          type="file"
                          style={{ display: "none" }}
                          ref={(el) => (fileInput = el)}
                          accept=".pdf,.doc,.docx,.zip,.jpg,.png"
                          onChange={(e) => handleSubmit(a._id, e.target.files[0])}
                        />
                        <button
                          className={`btn btn-primary btn-sm`}
                          disabled={uploading === a._id}
                          onClick={() => fileInput.click()}
                        >
                          <MdUpload size={14} />
                          {uploading === a._id ? "Uploading..." : "Submit Work"}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
