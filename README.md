# Dayflow – Human Resource Management System (HRMS)
> *Every workday, perfectly aligned.*

---

## 🌟 Overview
**Dayflow** is a centralized Human Resource Management System built for modern Indian and global enterprise workforce operations:
- **Authentication & RBAC**: Strict separation between Employee and Admin / HR Officer roles.
- **Indian Profile Management**: Comprehensive records tailored with Indian designations, state/city addresses, and contacts.
- **Attendance Tracking**: Real-time clock in/out, daily work hour calculation, and weekly/monthly logs.
- **Leave & Time-Off**: Multi-type leave requests (Paid, Sick, Unpaid), live duration calculator, HR approval workflows, and audit notes.
- **Payroll & Compensation (INR / ₹)**: Full salary breakdown (Base Salary, HRA, Transport, Medical Allowance, Provident Fund (PF), Professional Tax, TDS) and monthly payslip generation.
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
npm run seed     # Seeds database with Indian demo accounts, attendance, leaves & salaries
npm start        # Launches backend API on http://localhost:5050
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install
npm run dev      # Launches React app on http://localhost:5173
```

---

## 🔑 Pre-Seeded Demo Accounts (India)

| Role | Name | Email | Password | Location | Emp ID |
|---|---|---|---|---|---|
| **👑 Admin (HR Head)** | Priya Sharma | `admin@dayflow.com` | `Admin@123` | Indiranagar, Bengaluru, KA | `ADM001` |
| **👤 Senior Engineer** | Aarav Patel | `aarav.patel@dayflow.com` | `Employee@123` | Bellandur, Bengaluru, KA | `EMP001` |
| **👤 Lead UI/UX Designer** | Ananya Iyer | `ananya.iyer@dayflow.com` | `Employee@123` | Bandra West, Mumbai, MH | `EMP002` |
| **👤 Cloud Architect** | Rohan Verma | `rohan.verma@dayflow.com` | `Employee@123` | DLF Phase 5, Gurugram, HR | `EMP003` |

---

## 💰 Compensation Structure (INR / ₹)
All figures formatted with Indian numbering system (`en-IN`):
- **Base Pay + House Rent Allowance (HRA) + Transport + Medical**
- **Deductions:** Provident Fund (PF), Professional Tax, Tax Deducted at Source (TDS)
- **Net Monthly Take-Home in ₹**