import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import StatusBadge from '../../components/StatusBadge';
import EmptyState from '../../components/EmptyState';
import { useAuth } from '../../context/AuthContext';
import { attendanceAPI, leaveAPI } from '../../services/api';
import { Link } from 'react-router-dom';
import {
  CalendarCheck,
  Clock3,
  CalendarDays,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

export default function EmployeeDashboard() {
  const { user } = useAuth();
  const [attendance, setAttendance] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [todayRecord, setTodayRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getGreetingTime = () => {
    const hour = time.getHours();
    if (hour < 12) return 'morning';
    if (hour < 17) return 'afternoon';
    return 'evening';
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [attRes, leaveRes] = await Promise.allSettled([
          attendanceAPI.getMyAttendance({ week: true }),
          leaveAPI.getMyLeaves(),
        ]);
        if (attRes.status === 'fulfilled') {
          const recs = attRes.value.data.records || [];
          setAttendance(recs);
          const today = new Date().toISOString().split('T')[0];
          setTodayRecord(recs.find((r) => r.date === today) || null);
        }
        if (leaveRes.status === 'fulfilled') {
          setLeaves((leaveRes.value.data.leaves || []).slice(0, 5));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const pendingLeaves = leaves.filter((l) => l.status === 'PENDING').length;
  const approvedLeaves = leaves.filter((l) => l.status === 'APPROVED').length;
  const presentDays = attendance.filter((r) => r.status === 'PRESENT').length;

  const firstName = user?.firstName || 'there';

  return (
    <Layout title="Dashboard">
      <div className="page-header">
        <div>
          <h2 className="page-title">
            Good {getGreetingTime()}, {firstName}.
          </h2>
          <p className="page-subtitle">
            {time.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </div>

      {loading ? (
        <div className="loading-page">
          <div className="spinner-lg" />
        </div>
      ) : (
        <>
          {/* Live Check-In Bar */}
          <div className="card mb-6" style={{ background: '#FFFFFF', border: '1px solid var(--border-color)' }}>
            <div className="flex justify-between items-center flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div
                  style={{
                    fontSize: '1.5rem',
                    fontWeight: 700,
                    letterSpacing: '-0.02em',
                    color: 'var(--text-primary)',
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {time.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </div>
                <div style={{ height: 28, width: 1, background: 'var(--border-color)' }} />
                <div className="text-sm">
                  {todayRecord?.checkIn ? (
                    todayRecord.checkOut ? (
                      <span className="text-secondary">
                        Logged {todayRecord.workHours} hrs ({todayRecord.checkIn} → {todayRecord.checkOut})
                      </span>
                    ) : (
                      <span className="text-success font-medium">
                        Active shift · Clocked in at {todayRecord.checkIn}
                      </span>
                    )
                  ) : (
                    <span className="text-muted">Not clocked in yet for today</span>
                  )}
                </div>
              </div>

              <Link to="/employee/attendance" className="btn btn-primary btn-sm">
                <CalendarCheck size={14} /> Manage Attendance <ArrowRight size={13} />
              </Link>
            </div>
          </div>

          {/* Metric Cards */}
          <div className="stat-grid">
            <div className="stat-card">
              <div className="stat-card-top">
                <span className="stat-card-label">Presence (This Week)</span>
                <div className="stat-card-icon-wrapper green">
                  <CalendarCheck size={16} />
                </div>
              </div>
              <div className="stat-card-value">{presentDays} / 5</div>
              <div className="stat-card-meta">
                <TrendingUp size={12} className="text-success" />
                <span>Standard working days</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-card-top">
                <span className="stat-card-label">Pending Time-Off</span>
                <div className="stat-card-icon-wrapper amber">
                  <Clock3 size={16} />
                </div>
              </div>
              <div className="stat-card-value">{pendingLeaves}</div>
              <div className="stat-card-meta">
                <span>Applications under review</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-card-top">
                <span className="stat-card-label">Approved Leaves</span>
                <div className="stat-card-icon-wrapper blue">
                  <CheckCircle2 size={16} />
                </div>
              </div>
              <div className="stat-card-value">{approvedLeaves}</div>
              <div className="stat-card-meta">
                <span>Approved records</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-card-top">
                <span className="stat-card-label">Hours Logged Today</span>
                <div className="stat-card-icon-wrapper indigo">
                  <Clock3 size={16} />
                </div>
              </div>
              <div className="stat-card-value">{todayRecord?.workHours || 0} hrs</div>
              <div className="stat-card-meta">
                <span>Daily shift duration</span>
              </div>
            </div>
          </div>

          {/* Grid: Weekly Attendance + Recent Leave Requests */}
          <div className="grid-2">
            {/* Weekly Attendance Strip */}
            <div className="card">
              <div className="card-header">
                <div>
                  <h3 className="card-title">This Week's Attendance</h3>
                  <p className="card-subtitle">Daily check-in summary</p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 8, justifyContent: 'space-between' }}>
                {weekDays.map((day, i) => {
                  const rec = attendance[i];
                  const status = rec?.status || null;
                  return (
                    <div key={day} style={{ textAlign: 'center', flex: 1 }}>
                      <div
                        style={{
                          width: '100%',
                          height: 48,
                          borderRadius: 'var(--radius-md)',
                          background:
                            status === 'PRESENT'
                              ? 'var(--success-bg)'
                              : status === 'HALF_DAY'
                              ? 'var(--warning-bg)'
                              : status === 'LEAVE'
                              ? 'var(--info-bg)'
                              : status === 'ABSENT'
                              ? 'var(--danger-bg)'
                              : 'var(--bg-app)',
                          border: `1px solid ${
                            status === 'PRESENT'
                              ? 'var(--success-border)'
                              : status === 'HALF_DAY'
                              ? 'var(--warning-border)'
                              : status === 'LEAVE'
                              ? 'var(--info-border)'
                              : status === 'ABSENT'
                              ? 'var(--danger-border)'
                              : 'var(--border-color)'
                          }`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginBottom: 6,
                          fontSize: '12px',
                          fontWeight: 600,
                          color: status ? 'var(--text-primary)' : 'var(--text-muted)',
                        }}
                      >
                        {status ? status[0] : '—'}
                      </div>
                      <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 500 }}>
                        {day}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Leave Applications */}
            <div className="card">
              <div className="card-header">
                <div>
                  <h3 className="card-title">Recent Leave Requests</h3>
                  <p className="card-subtitle">Status of submitted time-off</p>
                </div>
                <Link to="/employee/leave" className="btn btn-ghost btn-sm">
                  View all <ArrowRight size={13} />
                </Link>
              </div>

              {leaves.length === 0 ? (
                <EmptyState
                  title="No leave requests"
                  description="You have not submitted any leave applications."
                  icon={CalendarDays}
                />
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {leaves.map((leave) => (
                    <div
                      key={leave._id}
                      className="flex items-center justify-between"
                      style={{
                        padding: '10px 12px',
                        background: 'var(--bg-app)',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border-color)',
                      }}
                    >
                      <div>
                        <div className="font-semibold text-primary text-sm">
                          {leave.leaveType} Leave ({leave.durationDays} days)
                        </div>
                        <div className="text-xs text-muted">
                          {new Date(leave.startDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })} →{' '}
                          {new Date(leave.endDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                        </div>
                      </div>
                      <StatusBadge status={leave.status} />
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
