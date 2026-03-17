// Classes.jsx
import { useState, useEffect } from "react";
import { classAPI } from "../../api";
import { MdOpenInNew, MdCalendarToday } from "react-icons/md";
import { format } from "date-fns";

export default function StudentClasses() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    classAPI.getUpcoming()
      .then((res) => setClasses(res.data.classes))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="spinner" />;

  return (
    <div>
      <div className="page-header">
        <div><h1 className="page-title">Upcoming Classes</h1><p className="page-subtitle">Your scheduled live sessions</p></div>
      </div>
      {classes.length === 0 ? (
        <div className="empty-state"><MdCalendarToday size={50} /><h3>No upcoming classes</h3><p>Your instructor hasn't scheduled any classes yet</p></div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {classes.map((cls) => (
            <div key={cls._id} className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, flexWrap: "wrap", borderLeft: "3px solid var(--blue)" }}>
              <div>
                <h3 style={{ fontSize: 17, fontWeight: 700 }}>{cls.title}</h3>
                <div style={{ fontSize: 13, color: "var(--text2)", marginTop: 6, display: "flex", gap: 16, flexWrap: "wrap" }}>
                  <span><MdCalendarToday size={13} style={{ marginRight: 4 }} />{format(new Date(cls.date), "EEEE, MMMM dd yyyy · h:mm a")}</span>
                  <span>⏱ {cls.duration} minutes</span>
                  <span>📚 {cls.batch?.name}</span>
                  <span>👨‍🏫 {cls.instructor?.name}</span>
                </div>
                {cls.description && <p style={{ fontSize: 13, color: "var(--text3)", marginTop: 8 }}>{cls.description}</p>}
              </div>
              <a href={cls.meetingLink} target="_blank" rel="noreferrer" className="btn btn-primary">
                <MdOpenInNew size={16} /> Join Class
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
