import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";
import { MdEmail, MdLock, MdSchool } from "react-icons/md";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      toast.success(`Welcome back, ${user.name}!`);
      navigate(`/${user.role}`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg)", padding: 20 }}>
      <div style={{ width: "100%", maxWidth: 420 }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{ width: 60, height: 60, background: "var(--accent-dim)", borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", border: "1px solid var(--accent)" }}>
            <MdSchool size={30} color="var(--accent2)" />
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 800 }}>Learn<span style={{ color: "var(--accent2)" }}>Hub</span></h1>
          <p style={{ color: "var(--text2)", marginTop: 8, fontSize: 14 }}>Sign in to your account</p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div style={{ position: "relative" }}>
                <MdEmail style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text3)" }} />
                <input
                  type="email"
                  className="form-input"
                  style={{ paddingLeft: 38 }}
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position: "relative" }}>
                <MdLock style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text3)" }} />
                <input
                  type="password"
                  className="form-input"
                  style={{ paddingLeft: 38 }}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-lg w-full" disabled={loading} style={{ marginTop: 4 }}>
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div style={{ textAlign: "center", marginTop: 20, fontSize: 14, color: "var(--text2)" }}>
            Don't have an account?{" "}
            <Link to="/register" style={{ color: "var(--accent2)", fontWeight: 600 }}>Sign up</Link>
          </div>
        </div>

        {/* Demo credentials */}
        <div style={{ marginTop: 20, padding: 16, background: "var(--bg2)", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)" }}>
          <p style={{ fontSize: 12, color: "var(--text3)", marginBottom: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Demo Credentials</p>
          {[
            { role: "Admin", email: "admin@lms.com", pass: "admin123" },
            { role: "Instructor", email: "instructor@lms.com", pass: "pass123" },
            { role: "Student", email: "student@lms.com", pass: "pass123" },
          ].map((d) => (
            <div
              key={d.role}
              style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 6, cursor: "pointer", padding: "4px 8px", borderRadius: 6, transition: "background 0.2s" }}
              onClick={() => setForm({ email: d.email, password: d.pass })}
              onMouseEnter={(e) => e.currentTarget.style.background = "var(--bg3)"}
              onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
            >
              <span style={{ color: "var(--text2)", fontWeight: 600 }}>{d.role}</span>
              <span style={{ color: "var(--text3)", fontFamily: "var(--mono)" }}>{d.email}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
