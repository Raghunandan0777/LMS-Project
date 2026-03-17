import axios from "axios";

const API = axios.create({ baseURL: "/api" });

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("lms_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("lms_token");
      localStorage.removeItem("lms_user");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

export default API;

// ─── Auth ───
export const authAPI = {
  register: (data) => API.post("/auth/register", data),
  login: (data) => API.post("/auth/login", data),
  getMe: () => API.get("/auth/me"),
  updateProfile: (data) => API.put("/auth/profile", data),
  changePassword: (data) => API.put("/auth/change-password", data),
};

// ─── Courses ───
export const courseAPI = {
  getAll: (params) => API.get("/courses", { params }),
  getMy: () => API.get("/courses/my"),
  getById: (id) => API.get(`/courses/${id}`),
  create: (data) => API.post("/courses", data, { headers: { "Content-Type": "multipart/form-data" } }),
  update: (id, data) => API.put(`/courses/${id}`, data, { headers: { "Content-Type": "multipart/form-data" } }),
  delete: (id) => API.delete(`/courses/${id}`),
  togglePublish: (id) => API.patch(`/courses/${id}/publish`),
};

// ─── Lessons ───
export const lessonAPI = {
  createModule: (data) => API.post("/lessons/module", data),
  updateModule: (id, data) => API.put(`/lessons/module/${id}`, data),
  deleteModule: (id) => API.delete(`/lessons/module/${id}`),
  createLesson: (data) => API.post("/lessons", data, { headers: { "Content-Type": "multipart/form-data" } }),
  updateLesson: (id, data) => API.put(`/lessons/${id}`, data, { headers: { "Content-Type": "multipart/form-data" } }),
  deleteLesson: (id) => API.delete(`/lessons/${id}`),
  markComplete: (id, data) => API.post(`/lessons/${id}/complete`, data),
};

// ─── Batches ───
export const batchAPI = {
  getAll: () => API.get("/batches"),
  getMy: () => API.get("/batches/my"),
  getById: (id) => API.get(`/batches/${id}`),
  create: (data) => API.post("/batches", data),
  update: (id, data) => API.put(`/batches/${id}`, data),
  enroll: (id) => API.post(`/batches/${id}/enroll`),
  unenroll: (id) => API.delete(`/batches/${id}/unenroll`),
};

// ─── Classes ───
export const classAPI = {
  getByBatch: (batchId) => API.get(`/classes/batch/${batchId}`),
  getUpcoming: () => API.get("/classes/upcoming"),
  getInstructor: () => API.get("/classes/instructor"),
  create: (data) => API.post("/classes", data),
  update: (id, data) => API.put(`/classes/${id}`, data),
  delete: (id) => API.delete(`/classes/${id}`),
};

// ─── Assignments ───
export const assignmentAPI = {
  getByBatch: (batchId) => API.get(`/assignments/batch/${batchId}`),
  getById: (id) => API.get(`/assignments/${id}`),
  create: (data) => API.post("/assignments", data, { headers: { "Content-Type": "multipart/form-data" } }),
  update: (id, data) => API.put(`/assignments/${id}`, data, { headers: { "Content-Type": "multipart/form-data" } }),
  delete: (id) => API.delete(`/assignments/${id}`),
  submit: (id, data) => API.post(`/assignments/${id}/submit`, data, { headers: { "Content-Type": "multipart/form-data" } }),
  grade: (id, subId, data) => API.put(`/assignments/${id}/grade/${subId}`, data),
};

// ─── Quizzes ───
export const quizAPI = {
  getByBatch: (batchId) => API.get(`/quizzes/batch/${batchId}`),
  getById: (id) => API.get(`/quizzes/${id}`),
  create: (data) => API.post("/quizzes", data),
  update: (id, data) => API.put(`/quizzes/${id}`, data),
  delete: (id) => API.delete(`/quizzes/${id}`),
  attempt: (id, data) => API.post(`/quizzes/${id}/attempt`, data),
  getResults: (id) => API.get(`/quizzes/${id}/results`),
};

// ─── Admin ───
export const adminAPI = {
  getStats: () => API.get("/admin/stats"),
  getUsers: (params) => API.get("/admin/users", { params }),
  getPendingInstructors: () => API.get("/admin/instructors/pending"),
  approveInstructor: (id) => API.patch(`/admin/instructors/${id}/approve`),
  rejectInstructor: (id) => API.patch(`/admin/instructors/${id}/reject`),
  deleteUser: (id) => API.delete(`/admin/users/${id}`),
  getEnrollments: () => API.get("/admin/enrollments"),
  getCourses: () => API.get("/admin/courses"),
};

// ─── Student ───
export const studentAPI = {
  getDashboard: () => API.get("/student/dashboard"),
  getProgress: (courseId) => API.get(`/student/progress/${courseId}`),
};
