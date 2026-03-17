import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { courseAPI } from "../../api";
import { MdSearch, MdAccessTime, MdAttachMoney, MdPerson } from "react-icons/md";

export default function StudentCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [level, setLevel] = useState("");

  const fetchCourses = () => {
    setLoading(true);
    courseAPI.getAll({ search, level })
      .then((res) => setCourses(res.data.courses))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchCourses(); }, [search, level]);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Browse Courses</h1>
          <p className="page-subtitle">{courses.length} courses available</p>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 12, marginBottom: 28, flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
          <MdSearch style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text3)" }} />
          <input className="form-input" style={{ paddingLeft: 38 }} placeholder="Search courses..."
            value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select className="form-input" style={{ width: 160 }} value={level} onChange={(e) => setLevel(e.target.value)}>
          <option value="">All Levels</option>
          <option value="Beginner">Beginner</option>
          <option value="Intermediate">Intermediate</option>
          <option value="Advanced">Advanced</option>
        </select>
      </div>

      {loading ? <div className="spinner" /> : (
        courses.length === 0 ? (
          <div className="empty-state">
            <MdSearch size={50} />
            <h3>No courses found</h3>
            <p>Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="grid-3">
            {courses.map((course) => (
              <Link to={`/student/courses/${course._id}`} key={course._id} style={{ textDecoration: "none" }}>
                <div className="course-card">
                  {course.thumbnail
                    ? <img src={course.thumbnail} alt={course.title} className="course-thumbnail" />
                    : <div className="course-thumbnail-placeholder">📚</div>
                  }
                  <div className="course-body">
                    <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                      <span className="badge badge-purple">{course.level}</span>
                      <span className="badge badge-blue">{course.category}</span>
                    </div>
                    <div className="course-title">{course.title}</div>
                    <div style={{ fontSize: 13, color: "var(--text2)", marginTop: 6, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                      {course.description}
                    </div>
                    <div className="course-meta">
                      <span style={{ display: "flex", alignItems: "center", gap: 4 }}><MdPerson size={14} />{course.instructor?.name}</span>
                      {course.duration && <span style={{ display: "flex", alignItems: "center", gap: 4 }}><MdAccessTime size={14} />{course.duration}</span>}
                      <span style={{ display: "flex", alignItems: "center", gap: 4, marginLeft: "auto", color: "var(--green)", fontWeight: 700 }}>
                        <MdAttachMoney size={14} />{course.price === 0 ? "Free" : `₹${course.price}`}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )
      )}
    </div>
  );
}
