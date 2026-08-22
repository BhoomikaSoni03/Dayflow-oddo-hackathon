import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
});

// Attach JWT token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('dayflow_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auth
export const authAPI = {
  register: (data) => API.post('/auth/register', data),
  login: (data) => API.post('/auth/login', data),
  verifyEmail: (token) => API.get(`/auth/verify/${token}`),
  getMe: () => API.get('/auth/me'),
};

// Profile
export const profileAPI = {
  getMyProfile: () => API.get('/profile/me'),
  updateMyProfile: (data) => API.patch('/profile/me', data),
  getAllProfiles: () => API.get('/profile/all'),
  getProfileById: (userId) => API.get(`/profile/${userId}`),
  updateProfileById: (userId, data) => API.patch(`/profile/${userId}`, data),
};

// Attendance
export const attendanceAPI = {
  checkIn: () => API.post('/attendance/checkin'),
  checkOut: () => API.patch('/attendance/checkout'),
  getMyAttendance: (params) => API.get('/attendance/me', { params }),
  getAllAttendance: (params) => API.get('/attendance/all', { params }),
  getTodaySummary: () => API.get('/attendance/today-summary'),
};

// Leave
export const leaveAPI = {
  applyLeave: (data) => API.post('/leave/apply', data),
  getMyLeaves: () => API.get('/leave/me'),
  getAllLeaves: (params) => API.get('/leave/all', { params }),
  reviewLeave: (id, data) => API.patch(`/leave/${id}/review`, data),
};

// Payroll
export const payrollAPI = {
  getMySalary: () => API.get('/payroll/my-salary'),
  getMyPayrollRecords: () => API.get('/payroll/my-records'),
  getAllSalaries: () => API.get('/payroll/all-salaries'),
  getAllPayrollRecords: (params) => API.get('/payroll/all-records', { params }),
  upsertSalary: (userId, data) => API.put(`/payroll/salary/${userId}`, data),
  processPayroll: (userId, data) => API.post(`/payroll/process/${userId}`, data),
};

// Notifications
export const notificationAPI = {
  getMyNotifications: () => API.get('/notifications/me'),
  markAsRead: (id) => API.patch(`/notifications/${id}/read`),
  markAllAsRead: () => API.patch('/notifications/read-all'),
  broadcast: (data) => API.post('/notifications/broadcast', data),
};

// Reports
export const reportAPI = {
  getDashboard: () => API.get('/reports/dashboard'),
  getAttendanceReport: (params) => API.get('/reports/attendance', { params }),
  getLeaveReport: (params) => API.get('/reports/leave', { params }),
  getPayrollReport: (params) => API.get('/reports/payroll', { params }),
};

export default API;
