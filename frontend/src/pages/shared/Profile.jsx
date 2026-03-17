import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { authAPI } from "../../api";
import toast from "react-hot-toast";
import { MdPerson, MdLock, MdSave, MdSchool } from "react-icons/md";

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [tab, setTab] = useState("profile");
  const [profile, setProfile] = useState({ name: user?.name || "", bio: user?.bio || "" });
  const [passwords, setPasswords] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [saving, setSaving] = useState(false);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await authAPI.updateProfile(profile);
      updateUser(res.data.user);
      toast.success("Profile updated!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Error");
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSave = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) return toast.error("Passwords don't match");
    if (passwords.newPassword.length < 6) return toast.error("Password must be at least 6 characters");
    setSaving(true);
    try {
      await authAPI.changePassword({ currentPassword: passwords.currentPassword, newPassword: passwords.newPassword });
      toast.success("Password changed!");
      setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      toast.error(err.response?.data?.message || "Error");
    } finally {
      setSaving(false);
    }
  };

  const initials = user?.name?.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div style={{ maxWidth: 640, margin: "0 auto" }}>
      <div className="page-header">
        <div><h1 className="page-title">My Profile</h1><p className="page-subtitle">Manage your account settings</p></div>
      </div>

      {/* Profile card */}
      <div className="card" style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 28, flexWrap: "wrap" }}>
        <div style={{ width: 80, height: 80, borderRadius: "50%", background: "var(--accent-dim)", border: "3px solid var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, fontWeight: 800, color: "var(--accent2)", flexShrink: 0 }}>
          {initials}
        </div>
        <div>
          <div style={{ fontSize: 22, fontWeight: 800 }}>{user?.name}</div>
          <div style={{ color: "var(--text2)", marginTop: 4 }}>{user?.email}</div>
          <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
            <span className={`badge badge-${user?.role === "admin" ? "red" : user?.role === "instructor" ? "amber" : "blue"}`}>
              {user?.role}
            </span>
            {user?.role === "instructor" && (
              <span className={`badge badge-${user?.isApproved ? "green" : "amber"}`}>
                {user?.isApproved ? "Approved" : "Pending Approval"}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="tabs">
        <button className={`tab${tab === "profile" ? " active" : ""}`} onClick={() => setTab("profile")}>
          <MdPerson size={15} style={{ marginRight: 6 }} />Profile
        </button>
        <button className={`tab${tab === "password" ? " active" : ""}`} onClick={() => setTab("password")}>
          <MdLock size={15} style={{ marginRight: 6 }} />Password
        </button>
      </div>

      {tab === "profile" && (
        <div className="card">
          <form onSubmit={handleProfileSave} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input className="form-input" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} required />
            </div>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input className="form-input" value={user?.email} disabled style={{ opacity: 0.6, cursor: "not-allowed" }} />
              <div className="form-error">Email cannot be changed</div>
            </div>
            <div className="form-group">
              <label className="form-label">Bio</label>
              <textarea className="form-input" value={profile.bio} onChange={(e) => setProfile({ ...profile, bio: e.target.value })} placeholder="Tell us about yourself..." style={{ minHeight: 100 }} />
            </div>
            <div className="form-group">
              <label className="form-label">Role</label>
              <input className="form-input" value={user?.role} disabled style={{ opacity: 0.6, cursor: "not-allowed", textTransform: "capitalize" }} />
            </div>
            <button type="submit" className="btn btn-primary" disabled={saving} style={{ alignSelf: "flex-start" }}>
              <MdSave size={16} /> {saving ? "Saving..." : "Save Changes"}
            </button>
          </form>
        </div>
      )}

      {tab === "password" && (
        <div className="card">
          <form onSubmit={handlePasswordSave} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <div className="form-group">
              <label className="form-label">Current Password</label>
              <input type="password" className="form-input" value={passwords.currentPassword}
                onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })} required />
            </div>
            <div className="form-group">
              <label className="form-label">New Password</label>
              <input type="password" className="form-input" value={passwords.newPassword}
                onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })} required placeholder="Min. 6 characters" />
            </div>
            <div className="form-group">
              <label className="form-label">Confirm New Password</label>
              <input type="password" className="form-input" value={passwords.confirmPassword}
                onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })} required />
            </div>
            <button type="submit" className="btn btn-primary" disabled={saving} style={{ alignSelf: "flex-start" }}>
              <MdLock size={16} /> {saving ? "Changing..." : "Change Password"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
