import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";
import { MdSchool } from "react-icons/md";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "", role: "student" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) return toast.error("Passwords do not match");
    if (form.password.length < 6) return toast.error("Password must be at least 6 characters");
    setLoading(true);
    try {
      const result = await register({ name: form.name, email: form.email, password: form.password, role: form.role });
      if (form.role === "instructor") {
        toast.success("Registered! Awaiting admin approval.");
        navigate("/login");
      } else {
        toast.success("Account created!");
        navigate(`/${result.user.role}`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg)", padding: 20 }}>
      <div style={{ width: "100%", maxWidth: 440 }}>
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{ width: 60, height: 60, background: "var(--accent-dim)", borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", border: "1px solid var(--accent)" }}>
            <MdSchool size={30} color="var(--accent2)" />
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 800 }}>Learn<span style={{ color: "var(--accent2)" }}>Hub</span></h1>
          <p style={{ color: "var(--text2)", marginTop: 8, fontSize: 14 }}>Create your account</p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input className="form-input" placeholder="John Doe" value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input type="email" className="form-input" placeholder="you@example.com" value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            </div>
            <div className="form-group">
              <label className="form-label">I want to join as</label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {["student", "instructor"].map((role) => (
                  <button
                    type="button"
                    key={role}
                    onClick={() => setForm({ ...form, role })}
                    style={{
                      padding: "12px 16px", borderRadius: "var(--radius-sm)", border: `2px solid ${form.role === role ? "var(--accent)" : "var(--border)"}`,
                      background: form.role === role ? "var(--accent-dim)" : "var(--bg3)",
                      color: form.role === role ? "var(--accent2)" : "var(--text2)",
                      fontWeight: 600, fontSize: 14, cursor: "pointer", textTransform: "capitalize", transition: "all 0.2s",
                    }}
                  >
                    {role === "student" ? "🎓" : "📚"} {role}
                  </button>
                ))}
              </div>
              {form.role === "instructor" && (
                <p style={{ fontSize: 12, color: "var(--amber)", marginTop: 6 }}>
                  ⚠ Instructor accounts require admin approval before access
                </p>
              )}
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input type="password" className="form-input" placeholder="Min. 6 characters" value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })} required />
            </div>
            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <input type="password" className="form-input" placeholder="Re-enter password" value={form.confirmPassword}
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} required />
            </div>
            <button type="submit" className="btn btn-primary btn-lg w-full" disabled={loading} style={{ marginTop: 4 }}>
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>
          <div style={{ textAlign: "center", marginTop: 20, fontSize: 14, color: "var(--text2)" }}>
            Already have an account?{" "}
            <Link to="/login" style={{ color: "var(--accent2)", fontWeight: 600 }}>Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
