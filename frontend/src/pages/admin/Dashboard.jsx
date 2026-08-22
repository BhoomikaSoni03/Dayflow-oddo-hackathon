import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import Avatar from '../../components/Avatar';
import StatusBadge from '../../components/StatusBadge';
import EmptyState from '../../components/EmptyState';
import { reportAPI, profileAPI, leaveAPI, attendanceAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import {
  Users,
  UserCheck,
  CalendarDays,
  Clock3,
  Wallet,
  ArrowRight,
  TrendingUp,
  Activity,
  CheckCircle2,
  CalendarCheck,
} from 'lucide-react';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [recentLeaves, setRecentLeaves] = useState([]);
  const [recentAttendance, setRecentAttendance] = useState([]);
  const [loading, setLoading] = useState(true);

  const getGreetingTime = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'morning';
    if (hour < 17) return 'afternoon';
    return 'evening';
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [dashRes, empRes, leaveRes, attRes] = await Promise.allSettled([
          reportAPI.getDashboard(),
          profileAPI.getAllProfiles(),
          leaveAPI.getAllLeaves({ status: 'PENDING' }),
          attendanceAPI.getAllAttendance({}),
        ]);

        if (dashRes.status === 'fulfilled') setData(dashRes.value.data.dashboard);
        if (empRes.status === 'fulfilled') setEmployees((empRes.value.data.profiles || []).slice(0, 4));
        if (leaveRes.status === 'fulfilled') setRecentLeaves((leaveRes.value.data.leaves || []).slice(0, 4));
        if (attRes.status === 'fulfilled') setRecentAttendance((attRes.value.data.records || []).slice(0, 5));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const totalEmployees = data?.totalEmployees || 0;
  const presentCount = data?.presentToday || 0;
  const leaveCount = data?.onLeaveToday || 0;
  const pendingCount = data?.pendingLeaves || 0;
  const totalPayroll = data?.totalPayroll || 0;

  const presentPercentage = totalEmployees > 0 ? ((presentCount / totalEmployees) * 100).toFixed(1) : '0';
  const leavePercentage = totalEmployees > 0 ? ((leaveCount / totalEmployees) * 100).toFixed(1) : '0';

  const formatLakhs = (val) => {
    if (!val) return '₹0';
    if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
    return `₹${val.toLocaleString('en-IN')}`;
  };

  const adminFirstName = user?.firstName || 'there';

  return (
    <Layout title="Dashboard">
      {/* Header Greeting */}
      <div className="page-header">
        <div>
          <h2 className="page-title">
            Good {getGreetingTime()}, {adminFirstName}.
          </h2>
          <p className="page-subtitle">Here's your workforce overview for today.</p>
        </div>
      </div>

      {loading ? (
        <div className="loading-page">
          <div className="spinner-lg" />
        </div>
      ) : (
        <>
          {/* Key Performance Indicators (KPIs) */}
          <div className="stat-grid">
            <div className="stat-card">
              <div className="stat-card-top">
                <span className="stat-card-label">Total Employees</span>
                <div className="stat-card-icon-wrapper indigo">
                  <Users size={16} />
                </div>
              </div>
              <div className="stat-card-value">{totalEmployees}</div>
              <div className="stat-card-meta">
                <TrendingUp size={12} className="text-success" />
                <span>Active registered workforce</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-card-top">
                <span className="stat-card-label">Present Today</span>
                <div className="stat-card-icon-wrapper green">
                  <UserCheck size={16} />
                </div>
              </div>
              <div className="stat-card-value">{presentCount}</div>
              <div className="stat-card-meta">
                <span className="font-semibold text-success">{presentPercentage}%</span>
                <span>of total staff</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-card-top">
                <span className="stat-card-label">On Leave</span>
                <div className="stat-card-icon-wrapper amber">
                  <CalendarDays size={16} />
                </div>
              </div>
              <div className="stat-card-value">{leaveCount}</div>
              <div className="stat-card-meta">
                <span className="font-semibold text-secondary">{leavePercentage}%</span>
                <span>scheduled absence</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-card-top">
                <span className="stat-card-label">Pending Requests</span>
                <div className="stat-card-icon-wrapper red">
                  <Clock3 size={16} />
                </div>
              </div>
              <div className="stat-card-value">{pendingCount}</div>
              <div className="stat-card-meta">
                <span>{pendingCount === 1 ? '1 requires attention' : `${pendingCount} require attention`}</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-card-top">
                <span className="stat-card-label">Monthly Payroll</span>
                <div className="stat-card-icon-wrapper blue">
                  <Wallet size={16} />
                </div>
              </div>
              <div className="stat-card-value">{formatLakhs(totalPayroll)}</div>
              <div className="stat-card-meta">
                <span>Estimated commitment</span>
              </div>
            </div>
          </div>

          {/* Main Grid: Left Column (Employees & Leave) + Right Column (Workforce & Activity) */}
          <div className="grid-2 mb-6">
            {/* Employee Directory Preview */}
            <div className="card">
              <div className="card-header">
                <div>
                  <h3 className="card-title">Workforce Preview</h3>
                  <p className="card-subtitle">Recent members of the organization</p>
                </div>
                <Link to="/admin/employees" className="btn btn-ghost btn-sm">
                  View all <ArrowRight size={13} />
                </Link>
              </div>

              {employees.length === 0 ? (
                <EmptyState
                  title="No employees found"
                  description="Add team members to get started."
                  icon={Users}
                />
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {employees.map((emp) => (
                    <div
                      key={emp._id}
                      className="flex items-center justify-between"
                      style={{
                        padding: '10px 12px',
                        borderRadius: 'var(--radius-md)',
                        background: 'var(--bg-app)',
                        border: '1px solid var(--border-color)',
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar
                          name={`${emp.firstName} ${emp.lastName}`}
                          size="sm"
                          src={emp.profilePicture}
                        />
                        <div>
                          <div className="font-semibold text-primary text-sm">
                            {emp.firstName} {emp.lastName}
                          </div>
                          <div className="text-xs text-muted">
                            {emp.designation || 'Staff'} · {emp.department || 'General'}
                          </div>
                        </div>
                      </div>
                      <StatusBadge status={emp.employmentType || 'FULL_TIME'} />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Leave Requests Requiring Attention */}
            <div className="card">
              <div className="card-header">
                <div>
                  <h3 className="card-title">Leave Requests</h3>
                  <p className="card-subtitle">Applications awaiting administrative review</p>
                </div>
                <Link to="/admin/leave" className="btn btn-ghost btn-sm">
                  Review queue <ArrowRight size={13} />
                </Link>
              </div>

              {recentLeaves.length === 0 ? (
                <EmptyState
                  title="No pending requests"
                  description="All submitted leave applications have been reviewed."
                  icon={CalendarCheck}
                />
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {recentLeaves.map((l) => (
                    <div
                      key={l._id}
                      className="flex items-center justify-between"
                      style={{
                        padding: '10px 12px',
                        borderRadius: 'var(--radius-md)',
                        background: 'var(--bg-app)',
                        border: '1px solid var(--border-color)',
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar
                          name={l.employeeId?.employeeId || 'Staff'}
                          size="sm"
                        />
                        <div>
                          <div className="font-semibold text-primary text-sm">
                            {l.employeeId?.employeeId} · {l.leaveType} Leave
                          </div>
                          <div className="text-xs text-muted">
                            {l.durationDays} day(s) · {new Date(l.startDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })} - {new Date(l.endDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                          </div>
                        </div>
                      </div>
                      <StatusBadge status={l.status} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Secondary Grid: Workforce Breakdown & Recent Check-In Activity */}
          <div className="grid-2">
            {/* Today's Workforce Status Breakdown */}
            <div className="card">
              <div className="card-header">
                <div>
                  <h3 className="card-title">Today's Workforce</h3>
                  <p className="card-subtitle">Live daily attendance status summary</p>
                </div>
                <Link to="/admin/attendance" className="btn btn-ghost btn-sm">
                  Full log <ArrowRight size={13} />
                </Link>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div className="flex justify-between items-center" style={{ padding: '8px 0', borderBottom: '1px solid var(--border-color-light)' }}>
                  <div className="flex items-center gap-2">
                    <span className="badge-dot" style={{ background: 'var(--success-text)' }} />
                    <span className="text-sm text-secondary">Present</span>
                  </div>
                  <span className="font-semibold text-primary">{presentCount}</span>
                </div>

                <div className="flex justify-between items-center" style={{ padding: '8px 0', borderBottom: '1px solid var(--border-color-light)' }}>
                  <div className="flex items-center gap-2">
                    <span className="badge-dot" style={{ background: 'var(--warning-text)' }} />
                    <span className="text-sm text-secondary">Half Day</span>
                  </div>
                  <span className="font-semibold text-primary">{data?.halfDayToday || 0}</span>
                </div>

                <div className="flex justify-between items-center" style={{ padding: '8px 0', borderBottom: '1px solid var(--border-color-light)' }}>
                  <div className="flex items-center gap-2">
                    <span className="badge-dot" style={{ background: 'var(--info-text)' }} />
                    <span className="text-sm text-secondary">On Leave</span>
                  </div>
                  <span className="font-semibold text-primary">{leaveCount}</span>
                </div>

                <div className="flex justify-between items-center" style={{ padding: '8px 0' }}>
                  <div className="flex items-center gap-2">
                    <span className="badge-dot" style={{ background: 'var(--danger-text)' }} />
                    <span className="text-sm text-secondary">Absent / Unmarked</span>
                  </div>
                  <span className="font-semibold text-primary">{data?.absentToday || 0}</span>
                </div>
              </div>
            </div>

            {/* Derived Recent Activity Feed */}
            <div className="card">
              <div className="card-header">
                <div>
                  <h3 className="card-title">Recent Activity</h3>
                  <p className="card-subtitle">Latest attendance timestamps & logs</p>
                </div>
                <Activity size={16} className="text-muted" />
              </div>

              {recentAttendance.length === 0 ? (
                <EmptyState
                  title="No recent activity"
                  description="Activity entries will appear as employees check in."
                  icon={Activity}
                />
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {recentAttendance.map((rec) => (
                    <div
                      key={rec._id}
                      className="flex items-start gap-3"
                      style={{ paddingBottom: '10px', borderBottom: '1px solid var(--border-color-light)' }}
                    >
                      <div
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          background: rec.checkOut ? 'var(--info-text)' : 'var(--success-text)',
                          marginTop: '6px',
                          flexShrink: 0,
                        }}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div className="text-sm text-primary font-medium">
                          {rec.userId?.employeeId || 'Employee'} {rec.checkOut ? 'checked out' : 'checked in'}
                        </div>
                        <div className="text-xs text-muted mt-1">
                          {rec.date} · {rec.checkOut ? `Out at ${rec.checkOut}` : `In at ${rec.checkIn}`}
                        </div>
                      </div>
                      <StatusBadge status={rec.status} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </Layout>
  );
}
