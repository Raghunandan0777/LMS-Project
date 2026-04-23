import { useState, useEffect } from "react";
import { adminAPI } from "../../api";
import toast from "react-hot-toast";
import { MdSearch, MdDelete, MdPerson } from "react-icons/md";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState(() => {
    const saved = localStorage.getItem("adminUsers_roleFilter");
    return saved || "";
  });
  const [search, setSearch] = useState(() => {
    const saved = localStorage.getItem("adminUsers_search");
    return saved || "";
  });

  // Save filters to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("adminUsers_roleFilter", roleFilter);
  }, [roleFilter]);

  useEffect(() => {
    localStorage.setItem("adminUsers_search", search);
  }, [search]);

  const fetch = () => {
    setLoading(true);
    adminAPI
      .getUsers({ role: roleFilter })
      .then((res) => {
        setUsers(res.data.users);
        setTotal(res.data.total);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };
  useEffect(() => {
    fetch();
  }, [roleFilter]);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete user "${name}"? This cannot be undone.`))
      return;
    try {
      await adminAPI.deleteUser(id);
      toast.success("User deleted");
      fetch();
    } catch {
      toast.error("Error deleting user");
    }
  };

  const roleBadge = (role) => {
    const map = { admin: "red", instructor: "amber", student: "blue" };
    return <span className={`badge badge-${map[role] || "blue"}`}>{role}</span>;
  };

  const filtered = users.filter(
    (u) =>
      !search ||
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">User Management</h1>
          <p className="page-subtitle">{total} total users</p>
        </div>
      </div>

      {/* Filters */}
      <div
        style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap" }}
      >
        <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
          <MdSearch
            style={{
              position: "absolute",
              left: 12,
              top: "50%",
              transform: "translateY(-50%)",
              color: "var(--text3)",
            }}
          />
          <input
            className="form-input"
            style={{ paddingLeft: 38 }}
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        {["", "student", "instructor", "admin"].map((r) => (
          <button
            key={r}
            className={`btn btn-sm ${roleFilter === r ? "btn-primary" : "btn-secondary"}`}
            onClick={() => setRoleFilter(r)}
          >
            {r === "" ? "All" : r.charAt(0).toUpperCase() + r.slice(1)}s
          </button>
        ))}
      </div>

      {loading ? (
        <div className="spinner" />
      ) : (
        <div className="card" style={{ padding: 0 }}>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>User</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => (
                  <tr key={u._id}>
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
                          {u.name
                            ?.split(" ")
                            .map((n) => n[0])
                            .join("")
                            .slice(0, 2)
                            .toUpperCase()}
                        </div>
                        <span style={{ fontWeight: 600 }}>{u.name}</span>
                      </div>
                    </td>
                    <td>{u.email}</td>
                    <td>{roleBadge(u.role)}</td>
                    <td>
                      {u.role === "instructor" ? (
                        <span
                          className={`badge badge-${u.isApproved ? "green" : "amber"}`}
                        >
                          {u.isApproved ? "Approved" : "Pending"}
                        </span>
                      ) : (
                        <span className="badge badge-green">Active</span>
                      )}
                    </td>
                    <td style={{ color: "var(--text3)" }}>
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDelete(u._id, u.name)}
                      >
                        <MdDelete size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      style={{
                        textAlign: "center",
                        padding: 40,
                        color: "var(--text3)",
                      }}
                    >
                      No users found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
