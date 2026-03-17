import { useState, useEffect } from "react";
import { adminAPI } from "../../api";
import { MdBook, MdPerson, MdSearch } from "react-icons/md";

export default function AdminCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    adminAPI.getCourses()
      .then((res) => setCourses(res.data.courses))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = courses.filter((c) =>
    !search || c.title.toLowerCase().includes(search.toLowerCase()) ||
    c.instructor?.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="page-header">
        <div><h1 className="page-title">All Courses</h1><p className="page-subtitle">{courses.length} courses on platform</p></div>
      </div>
      <div style={{ position: "relative", marginBottom: 24, maxWidth: 400 }}>
        <MdSearch style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text3)" }} />
        <input className="form-input" style={{ paddingLeft: 38 }} placeholder="Search courses..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>
      {loading ? <div className="spinner" /> : (
        <div className="card" style={{ padding: 0 }}>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Course</th><th>Instructor</th><th>Level</th><th>Price</th><th>Status</th><th>Created</th></tr></thead>
              <tbody>
                {filtered.map((c) => (
                  <tr key={c._id}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 36, height: 36, borderRadius: 6, background: "var(--bg4)", overflow: "hidden", flexShrink: 0 }}>
                          {c.thumbnail ? <img src={c.thumbnail} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>📚</div>}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600 }}>{c.title}</div>
                          <div style={{ fontSize: 12, color: "var(--text3)" }}>{c.category}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <MdPerson size={14} color="var(--text3)" />
                        {c.instructor?.name}
                      </div>
                    </td>
                    <td><span className="badge badge-purple">{c.level}</span></td>
                    <td style={{ fontWeight: 600, color: "var(--green)" }}>{c.price === 0 ? "Free" : `₹${c.price}`}</td>
                    <td><span className={`badge badge-${c.isPublished ? "green" : "amber"}`}>{c.isPublished ? "Published" : "Draft"}</span></td>
                    <td style={{ color: "var(--text3)" }}>{new Date(c.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
                {filtered.length === 0 && <tr><td colSpan={6} style={{ textAlign: "center", padding: 40, color: "var(--text3)" }}>No courses found</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
