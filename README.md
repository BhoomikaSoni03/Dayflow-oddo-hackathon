# 🌟 Dayflow – Modern Human Resource Management System (HRMS)

> **Every workday, perfectly aligned.**  
> *Dayflow is an enterprise-grade HRMS designed to streamline human resource workflows, employee attendance, time-off requests, payroll management (INR / ₹), and real-time workforce communications .*

[![React](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-61DAFB?logo=react)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Backend-Node.js%20%2B%20Express-339933?logo=node.js)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB-47A248?logo=mongodb)](https://www.mongodb.com/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

---

## 📸 Screenshots & UI Showcase

### 🔐 Authentication
| Login | Register |
| :---: | :---: |
| ![Login Page](docs/screenshots/login_page.png) | ![Register Page](docs/screenshots/register_page.png) |

---

### 👑 Admin / HR Officer Views

| 📊 Admin Dashboard (KPIs & Analytics) | 👥 Employee Directory |
| :---: | :---: |
| ![Admin Dashboard](docs/screenshots/admin_dashboard.png) | ![Employees](docs/screenshots/admin_employees.png) |

| ⏱️ Attendance Tracking (All Staff) | 🌴 Leave Approvals & Time-Off |
| :---: | :---: |
| ![Admin Attendance](docs/screenshots/admin_attendance.png) | ![Admin Leave](docs/screenshots/admin_leave.png) |

| 💰 Payroll Disbursement | 📈 Analytics & BI Reports |
| :---: | :---: |
| ![Admin Payroll](docs/screenshots/admin_payroll.png) | ![Reports](docs/screenshots/admin_reports.png) |

| 🔔 Notifications & Broadcasts |
| :---: |
| ![Admin Notifications](docs/screenshots/admin_notifications.png) |

---

### 👤 Employee Self-Service Views

| 🏠 Employee Dashboard | 🪪 My Profile |
| :---: | :---: |
| ![Employee Dashboard](docs/screenshots/employee_dashboard.png) | ![Employee Profile](docs/screenshots/employee_profile.png) |

| ⏱️ My Attendance & Clock In/Out | 📝 My Leave Requests |
| :---: | :---: |
| ![Employee Attendance](docs/screenshots/employee_attendance.png) | ![Employee Leave](docs/screenshots/employee_leave.png) |

| 💵 My Payslips & Salary Breakdown |
| :---: |
| ![Employee Payroll](docs/screenshots/employee_payroll.png) |

---

## ✨ Key Features

- 🔐 **Role-Based Access Control (RBAC)**: Secure authentication differentiating between **HR Admins** and **Employees**.
- ⏱️ **Real-Time Attendance**: One-click check-in / check-out with automated work-hour calculations.
- 🌴 **Leave & Time-off Workflows**: Request Paid, Sick, and Unpaid leave with dynamic duration calculations, admin approvals, and audit notes.
- 💵 **Automated Payroll & Payslips (INR / ₹)**: Configurable compensation structures including Base Salary, HRA, Medical & Transport allowances, with deductions for PF, Professional Tax, and TDS.
- 🔔 **Instant Notification Center**: Live updates for leave request approvals/rejections and payroll disbursements.
- 📈 **Workforce Analytics & BI Reports**: Real-time summary charts for headcount, attendance trends, and payroll expenditure.

---

## 🏗️ System Design Architecture

```mermaid
graph TD
    Client["💻 Client (Browser / React + Vite SPA)"]
    
    subgraph Frontend["Frontend Layer (React.js)"]
        Router["React Router DOM (Protected Routes)"]
        AuthContext["Auth Context (JWT State & LocalStorage)"]
        AxiosClient["Axios Interceptor Instance"]
        GlassUI["Glassmorphism Component System"]
    end

    subgraph Backend["Backend API Layer (Express.js / Node.js)"]
        AuthMid["JWT Auth Middleware & RBAC Guard"]
        Controllers["Controllers (Auth, Attendance, Leave, Payroll, Reports)"]
        MongooseODM["Mongoose ODM Data Layer"]
    end

    subgraph Database["Database (MongoDB)"]
        UsersCol[("Users Collection")]
        ProfilesCol[("Profiles Collection")]
        AttendanceCol[("Attendance Collection")]
        LeavesCol[("Leave Requests Collection")]
        PayrollCol[("Payroll & Salary Collection")]
        NotifCol[("Notifications Collection")]
    end

    Client --> Router
    Router --> GlassUI
    GlassUI --> AuthContext
    AuthContext --> AxiosClient
    AxiosClient -->|"HTTP / REST API (Port 5050)"| AuthMid
    AuthMid --> Controllers
    Controllers --> MongooseODM
    MongooseODM --> UsersCol
    MongooseODM --> ProfilesCol
    MongooseODM --> AttendanceCol
    MongooseODM --> LeavesCol
    MongooseODM --> PayrollCol
    MongooseODM --> NotifCol
```

---

## 🗄️ Database Design (Entity-Relationship Diagram)

```mermaid
erDiagram
    USER ||--o{ EMPLOYEE_PROFILE : "has profile"
    USER ||--o{ ATTENDANCE : "logs"
    USER ||--o{ LEAVE_REQUEST : "submits"
    USER ||--o{ PAYROLL_RECORD : "receives"
    USER ||--o{ NOTIFICATION : "receives"
    USER ||--o| SALARY_STRUCTURE : "configured with"

    USER {
        ObjectId _id PK
        string name
        string email
        string password
        string role "admin | employee"
        string employeeId
        date createdAt
    }

    EMPLOYEE_PROFILE {
        ObjectId _id PK
        ObjectId userId FK
        string designation
        string department
        string phone
        string address
        string city
        string state
        date joiningDate
    }

    ATTENDANCE {
        ObjectId _id PK
        ObjectId userId FK
        date date
        string clockIn
        string clockOut
        number totalHours
        string status "Present | Late | Half-Day | Absent"
    }

    LEAVE_REQUEST {
        ObjectId _id PK
        ObjectId userId FK
        string type "Paid | Sick | Unpaid"
        date startDate
        date endDate
        number totalDays
        string reason
        string status "Pending | Approved | Rejected"
        string adminRemarks
    }

    SALARY_STRUCTURE {
        ObjectId _id PK
        ObjectId userId FK
        number baseSalary
        number hra
        number transportAllowance
        number medicalAllowance
        number pfDeduction
        number profTax
        number tds
        number netSalary
    }

    PAYROLL_RECORD {
        ObjectId _id PK
        ObjectId userId FK
        string month
        number year
        number grossEarnings
        number totalDeductions
        number netPayable
        string status "Generated | Disbursed"
        date disbursementDate
    }

    NOTIFICATION {
        ObjectId _id PK
        ObjectId userId FK
        string title
        string message
        string type "leave | payroll | system"
        boolean isRead
        date createdAt
    }
```

---

## 🛠️ Technology Stack

| Domain | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend Framework** | [React 19](https://react.dev/) + [Vite](https://vitejs.dev/) | Lightning fast UI rendering and hot module replacement |
| **Styling** | Vanilla CSS Glassmorphism | Custom responsive modern dark theme with smooth micro-animations |
| **Routing** | [React Router DOM v7](https://reactrouter.com/) | Protected route guards and nested dashboard navigation |
| **Icons** | [Lucide React](https://lucide.dev/) | Clean, minimalist SVG icon set |
| **Backend API** | [Node.js](https://nodejs.org/) & [Express.js](https://expressjs.com/) | Modular RESTful API backend |
| **Database** | [MongoDB](https://www.mongodb.com/) + [Mongoose](https://mongoosejs.com/) | Schema-driven document storage and relational joins |
| **Authentication** | JSON Web Tokens (JWT) + Bcrypt.js | Stateless authentication & cryptographic password hashing |

---

## 🚀 How to Run Locally

### 📋 Prerequisites
- **Node.js** (v18.0.0 or higher)
- **MongoDB** running locally on `mongodb://localhost:27017`

---

### Step 1: Clone the Repository
```bash
git clone https://github.com/BhoomikaSoni03/Dayflow-oddo-hackathon.git
cd Dayflow-oddo-hackathon
```

---

### Step 2: Backend Setup
```bash
# Navigate to backend directory
cd backend

# Install backend dependencies
npm install

# Seed the database with pre-configured demo users and records
npm run seed

# Start backend server
npm start
```
> 🌐 Backend will start on: **`http://localhost:5050`**

---

### Step 3: Frontend Setup
Open a new terminal window:
```bash
# Navigate to frontend directory
cd frontend

# Install frontend dependencies
npm install

# Start Vite development server
npm run dev
```
> 🌐 Frontend app will start on: **`http://localhost:5173`**

---

## 🔑 Demo Login Accounts

You can immediately sign in using any of the pre-configured seed accounts:

| Role | Name | Email | Password | Employee ID |
| :--- | :--- | :--- | :--- | :--- |
| **👑 Admin (HR Head)** | Priya Sharma | `admin@dayflow.com` | `Admin@123` | `ADM001` |
| **👤 Senior Engineer** | Aarav Patel | `aarav.patel@dayflow.com` | `Employee@123` | `EMP001` |
| **👤 Lead UI/UX Designer** | Ananya Iyer | `ananya.iyer@dayflow.com` | `Employee@123` | `EMP002` |
| **👤 Cloud Architect** | Rohan Verma | `rohan.verma@dayflow.com` | `Employee@123` | `EMP003` |

---

## 📁 Repository Structure

```
Dayflow-oddo-hackathon/
├── backend/
│   ├── src/
│   │   ├── config/          # MongoDB Mongoose connection
│   │   ├── controllers/     # Controller logic (Auth, Leaves, Attendance, Payroll)
│   │   ├── middleware/      # JWT validation & Role-based Access Control (RBAC)
│   │   ├── models/          # Mongoose Schemas (User, Attendance, Leaves, etc.)
│   │   ├── routes/          # Express API route declarations
│   │   ├── seed.js          # Pre-configured demo data generator
│   │   └── app.js           # Express application initialization
│   ├── .env.example
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/      # Glassmorphism Cards, Layouts, Navigation Bar
│   │   ├── context/         # AuthContext with session persistence
│   │   ├── pages/
│   │   │   ├── auth/        # Login & Register views
│   │   │   ├── admin/       # HR Management, Attendance, Payroll, Reports
│   │   │   └── employee/    # Employee Self-Service, Leave requests, Payslips
│   │   ├── services/        # Centralized Axios API service layer
│   │   ├── App.jsx          # Protected route declarations
│   │   └── index.css        # Global CSS design tokens
│   ├── index.html
│   └── package.json
│
├── docs/
│   └── screenshots/         # Application preview screenshots
└── README.md
```

---

## 📄 License
Distributed under the MIT License.
