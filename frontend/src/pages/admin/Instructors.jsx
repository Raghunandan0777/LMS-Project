import { useState, useEffect } from "react";
import { adminAPI } from "../../api";
import toast from "react-hot-toast";
import { MdCheckCircle, MdCancel, MdHourglassTop } from "react-icons/md";

export default function AdminInstructors() {
  const [pending, setPending] = useState([]);
  const [approved, setApproved] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);
  const [tab, setTab] = useState(() => {
    const saved = localStorage.getItem("adminInstructors_tab");
    return saved || "pending";
  });

  // Save tab state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("adminInstructors_tab", tab);
  }, [tab]);

  const fetch = () => {
    Promise.all([
      adminAPI.getPendingInstructors(),
      adminAPI.getUsers({ role: "instructor" }),
    ])
      .then(([p, a]) => {
        setPending(p.data.instructors);
        setApproved(a.data.users.filter((u) => u.isApproved));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };
  useEffect(() => {
    fetch();
  }, []);

  const handleApprove = async (id) => {
    setProcessing(id);
    try {
      await adminAPI.approveInstructor(id);
      toast.success("Instructor approved!");
      fetch();
    } catch {
      toast.error("Error");
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (id, name) => {
    if (!window.confirm(`Reject and delete "${name}"?`)) return;
    setProcessing(id);
    try {
      await adminAPI.rejectInstructor(id);
      toast.success("Rejected");
      fetch();
    } catch {
      toast.error("Error");
    } finally {
      setProcessing(null);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Instructor Management</h1>
          <p className="page-subtitle">
            {pending.length} pending · {approved.length} approved
          </p>
        </div>
      </div>

      <div className="tabs">
        <button
          className={`tab${tab === "pending" ? " active" : ""}`}
          onClick={() => setTab("pending")}
        >
          Pending Approval ({pending.length})
        </button>
        <button
          className={`tab${tab === "approved" ? " active" : ""}`}
          onClick={() => setTab("approved")}
        >
          Approved ({approved.length})
        </button>
      </div>

      {loading ? (
        <div className="spinner" />
      ) : (
        <>
          {tab === "pending" &&
            (pending.length === 0 ? (
              <div className="empty-state">
                <MdCheckCircle size={50} style={{ color: "var(--green)" }} />
                <h3>No pending approvals</h3>
                <p>All instructor requests have been processed</p>
              </div>
            ) : (
              <div
                style={{ display: "flex", flexDirection: "column", gap: 14 }}
              >
                {pending.map((inst) => (
                  <div
                    key={inst._id}
                    className="card"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 16,
                      flexWrap: "wrap",
                      borderLeft: "3px solid var(--amber)",
                    }}
                  >
                    <div
                      className="user-avatar"
                      style={{
                        width: 48,
                        height: 48,
                        fontSize: 16,
                        flexShrink: 0,
                      }}
                    >
                      {inst.name
                        ?.split(" ")
                        .map((n) => n[0])
                        .join("")
                        .slice(0, 2)
                        .toUpperCase()}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: 16 }}>
                        {inst.name}
                      </div>
                      <div style={{ fontSize: 14, color: "var(--text2)" }}>
                        {inst.email}
                      </div>
                      <div
                        style={{
                          fontSize: 13,
                          color: "var(--text3)",
                          marginTop: 4,
                        }}
                      >
                        Registered:{" "}
                        {new Date(inst.createdAt).toLocaleDateString()}
                      </div>
                      {inst.bio && (
                        <div
                          style={{
                            fontSize: 13,
                            color: "var(--text2)",
                            marginTop: 4,
                          }}
                        >
                          {inst.bio}
                        </div>
                      )}
                    </div>
                    <div style={{ display: "flex", gap: 10 }}>
                      <button
                        className="btn btn-success"
                        disabled={processing === inst._id}
                        onClick={() => handleApprove(inst._id)}
                      >
                        <MdCheckCircle size={16} />{" "}
                        {processing === inst._id ? "..." : "Approve"}
                      </button>
                      <button
                        className="btn btn-danger"
                        disabled={processing === inst._id}
                        onClick={() => handleReject(inst._id, inst.name)}
                      >
                        <MdCancel size={16} /> Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ))}

          {tab === "approved" &&
            (approved.length === 0 ? (
              <div className="empty-state">
                <h3>No approved instructors</h3>
              </div>
            ) : (
              <div className="card" style={{ padding: 0 }}>
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Instructor</th>
                        <th>Email</th>
                        <th>Status</th>
                        <th>Joined</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {approved.map((inst) => (
                        <tr key={inst._id}>
                          <td>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 10,
                              }}
                            >
                              <div
                                className="user-avatar"
                                style={{ width: 32, height: 32, fontSize: 12 }}
                              >
                                {inst.name
                                  ?.split(" ")
                                  .map((n) => n[0])
                                  .join("")
                                  .slice(0, 2)
                                  .toUpperCase()}
                              </div>
                              <span style={{ fontWeight: 600 }}>
                                {inst.name}
                              </span>
                            </div>
                          </td>
                          <td>{inst.email}</td>
                          <td>
                            <span className="badge badge-green">
                              <MdCheckCircle size={11} /> Approved
                            </span>
                          </td>
                          <td style={{ color: "var(--text3)" }}>
                            {new Date(inst.createdAt).toLocaleDateString()}
                          </td>
                          <td>
                            <button
                              className="btn btn-danger btn-sm"
                              onClick={() => handleReject(inst._id, inst.name)}
                            >
                              Revoke
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
        </>
      )}
    </div>
  );
}
