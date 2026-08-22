import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Avatar from './Avatar';
import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  CalendarDays,
  Wallet,
  BarChart3,
  Bell,
  User,
  LogOut,
  Layers,
} from 'lucide-react';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const displayName = user?.firstName
    ? `${user.firstName} ${user.lastName || ''}`.trim()
    : user?.email || 'User';

  return (
    <aside className="sidebar">
      {/* Brand Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-brand-icon">
          <Layers size={18} />
        </div>
        <span className="sidebar-brand-name">Dayflow</span>
        <span className="sidebar-brand-badge">HRMS</span>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {user?.role === 'ADMIN' ? (
          <>
            <div className="sidebar-section-title">Overview</div>
            <NavLink
              to="/admin/dashboard"
              className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
            >
              <LayoutDashboard size={18} />
              <span>Dashboard</span>
            </NavLink>

            <div className="sidebar-section-title">Workforce</div>
            <NavLink
              to="/admin/employees"
              className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
            >
              <Users size={18} />
              <span>Employees</span>
            </NavLink>
            <NavLink
              to="/admin/attendance"
              className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
            >
              <CalendarCheck size={18} />
              <span>Attendance</span>
            </NavLink>
            <NavLink
              to="/admin/leave"
              className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
            >
              <CalendarDays size={18} />
              <span>Leave Requests</span>
            </NavLink>

            <div className="sidebar-section-title">Finance & Reports</div>
            <NavLink
              to="/admin/payroll"
              className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
            >
              <Wallet size={18} />
              <span>Payroll</span>
            </NavLink>
            <NavLink
              to="/admin/reports"
              className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
            >
              <BarChart3 size={18} />
              <span>Reports & BI</span>
            </NavLink>
            <NavLink
              to="/admin/notifications"
              className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
            >
              <Bell size={18} />
              <span>Announcements</span>
            </NavLink>
          </>
        ) : (
          <>
            <div className="sidebar-section-title">Overview</div>
            <NavLink
              to="/employee/dashboard"
              className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
            >
              <LayoutDashboard size={18} />
              <span>Dashboard</span>
            </NavLink>

            <div className="sidebar-section-title">Self Service</div>
            <NavLink
              to="/employee/profile"
              className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
            >
              <User size={18} />
              <span>My Profile</span>
            </NavLink>
            <NavLink
              to="/employee/attendance"
              className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
            >
              <CalendarCheck size={18} />
              <span>Attendance</span>
            </NavLink>
            <NavLink
              to="/employee/leave"
              className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
            >
              <CalendarDays size={18} />
              <span>Time Off & Leave</span>
            </NavLink>
            <NavLink
              to="/employee/payroll"
              className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
            >
              <Wallet size={18} />
              <span>Salary & Payslips</span>
            </NavLink>
          </>
        )}
      </nav>

      {/* User Profile Footer */}
      <div className="sidebar-footer">
        <div className="sidebar-user-card">
          <Avatar name={displayName} size="sm" src={user?.profilePicture} />
          <div className="sidebar-user-details">
            <div className="sidebar-user-name">{displayName}</div>
            <div className="sidebar-user-role">
              {user?.role === 'ADMIN' ? 'HR Administrator' : user?.employeeId || 'Employee'}
            </div>
          </div>
          <button
            className="icon-btn"
            style={{ width: 28, height: 28, border: 'none', background: 'transparent' }}
            onClick={handleLogout}
            title="Sign Out"
          >
            <LogOut size={16} className="text-secondary" />
          </button>
        </div>
      </div>
    </aside>
  );
}
