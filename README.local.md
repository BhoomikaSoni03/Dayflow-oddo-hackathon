# Dayflow – Human Resource Management System (HRMS)
> *Every workday, perfectly aligned.*

---

## 🌟 Overview
**Dayflow** is a centralized Human Resource Management System built to digitize and automate workforce operations:
- **Authentication & RBAC**: Strict separation between Employee and Admin / HR Officer roles.
- **Profile Management**: Detailed personal, employment, and contact records.
- **Attendance Tracking**: Real-time clock in/out, daily work hour calculation, and weekly/monthly logs.
- **Leave & Time-Off**: Multi-type leave requests (Paid, Sick, Unpaid), live duration calculator, HR approval workflows, and audit notes.
- **Payroll & Compensation**: Salary structures, allowances, deductions breakdown, and monthly payslip records.
- **Workforce Announcements & Notifications**: Real-time alerts for leave approvals, payroll disbursements, and admin broadcasts.
- **Analytics & BI Reporting**: Dynamic dashboards displaying workforce KPIs, attendance health, and compensation summaries.

---

## 🛠️ Technology Stack
- **Database**: MongoDB with Mongoose ODM
- **Backend**: Node.js & Express.js REST API
- **Frontend**: React.js (Vite)
- **Styling**: Vanilla CSS Design System with dark glassmorphism aesthetic
- **Security & Auth**: JWT (JSON Web Tokens) with bcrypt password hashing

---

## 🚀 Quick Start Guide

### 1. Prerequisites
Ensure you have **Node.js (v18+)** and **MongoDB** running locally on `mongodb://localhost:27017`.

### 2. Backend Setup
```bash
cd backend
npm install
npm run seed     # Seeds database with demo accounts, attendance, leaves & salaries
npm start        # Launches backend API on http://localhost:5050
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install
npm run dev      # Launches React app on http://localhost:5173
```

---

## 🔑 Demo Credentials

| Role | Email | Password | Employee ID |
|---|---|---|---|
| **Admin / HR Officer** | `admin@dayflow.com` | `Admin@123` | `ADM001` |
| **Employee (Engineer)** | `alex.rivera@dayflow.com` | `Employee@123` | `EMP001` |
| **Employee (Designer)** | `elena.rostova@dayflow.com` | `Employee@123` | `EMP002` |

---

## 📁 Project Architecture
```
dayflow/
├── backend/
│   ├── src/
│   │   ├── config/          # db.js (MongoDB Mongoose connection)
│   │   ├── middleware/      # auth.js (JWT validation), rbac.js (Role guards)
│   │   ├── models/          # User, EmployeeProfile, Attendance, LeaveRequest, SalaryStructure, PayrollRecord, Notification
│   │   ├── controllers/     # Controller logic for all modules
│   │   ├── routes/          # Express REST API endpoints
│   │   ├── seed.js          # Database seeding script
│   │   └── app.js           # Server entry point
│   ├── .env
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/      # Sidebar, Layout, NotificationPanel, Glass Cards
    │   ├── context/         # AuthContext with session persistence
    │   ├── pages/
    │   │   ├── auth/        # Login, Register, VerifyEmail
    │   │   ├── employee/    # Dashboard, Profile, Attendance, Leave, Payroll
    │   │   └── admin/       # Dashboard, Employees, Attendance, Leave, Payroll, Reports, Notifications
    │   ├── services/        # Centralized Axios API client
    │   ├── App.jsx          # Protected route definitions
    │   ├── index.css        # Glassmorphism design system
    │   └── main.jsx
    └── package.json
```
