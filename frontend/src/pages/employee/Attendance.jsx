import { useState, useEffect, useCallback } from 'react';
import Layout from '../../components/Layout';
import StatusBadge from '../../components/StatusBadge';
import EmptyState from '../../components/EmptyState';
import { attendanceAPI } from '../../services/api';
import { CalendarCheck, Clock, Check, AlertCircle, LogIn, LogOut } from 'lucide-react';

export default function EmployeeAttendance() {
  const [records, setRecords] = useState([]);
  const [todayRecord, setTodayRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [msg, setMsg] = useState({ text: '', type: '' });
  const [view, setView] = useState('week'); // week | month
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const fetchAttendance = useCallback(async () => {
    try {
      const { data } = await attendanceAPI.getMyAttendance(
        view === 'week'
          ? { week: true }
          : { month: time.getMonth() + 1, year: time.getFullYear()}
      );
      setRecords(data.records || []);
      const today = new Date().toISOString().split('T')[0];
      setTodayRecord((data.records || []).find((r) => r.date === today) || null);
    } finally {
      setLoading(false);
    }
  }, [view, time]);

  useEffect(() => {
    fetchAttendance();
  }, [fetchAttendance]);

  const handleCheckIn = async () => {
    setActionLoading(true);
    try {
      await attendanceAPI.checkIn();
      setMsg({ text: 'Checked in successfully.', type: 'success' });
      fetchAttendance();
    } catch (err) {
      setMsg({ text: err.response?.data?.message || 'Check-in failed', type: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setActionLoading(true);
    try {
      await attendanceAPI.checkOut();
      setMsg({ text: 'Checked out successfully.', type: 'success' });
      fetchAttendance();
    } catch (err) {
      setMsg({ text: err.response?.data?.message || 'Check-out failed', type: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <Layout title="Attendance">
      <div className="page-header">
        <div>
          <h2 className="page-title">Attendance Tracking</h2>
          <p className="page-subtitle">Clock in/out for your daily shifts and monitor your working hours history.</p>
        </div>
      </div>

      {msg.text && (
        <div className={`alert alert-${msg.type}`} onClick={() => setMsg({ text: '', type: '' })}>
          {msg.type === 'success' ? <Check size={16} /> : <AlertCircle size={16} />}
          <span>{msg.text}</span>
        </div>
      )}

      {/* Grid: Check-In Widget + Today Summary */}
      <div className="grid-2 mb-6">
        {/* Check-in Card */}
        <div className="card text-center" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div className="text-xs font-semibold text-muted uppercase">
            {time.toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric' })}
          </div>
          <div
            style={{
              fontSize: '2.5rem',
              fontWeight: 800,
              color: 'var(--text-primary)',
              letterSpacing: '-0.03em',
              fontVariantNumeric: 'tabular-nums',
              margin: '8px 0',
            }}
          >
            {time.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </div>

          <div className="flex gap-2 mb-4">
            {todayRecord?.checkIn && (
              <span className="badge badge-success">
                Clocked In: {todayRecord.checkIn}
              </span>
            )}
            {todayRecord?.checkOut && (
              <span className="badge badge-info">
                Clocked Out: {todayRecord.checkOut}
              </span>
            )}
          </div>

          {!todayRecord?.checkIn ? (
            <button
              id="checkin-btn"
              className="btn btn-primary btn-lg"
              style={{ minWidth: 200 }}
              onClick={handleCheckIn}
              disabled={actionLoading}
            >
              {actionLoading ? <span className="spinner" /> : <><LogIn size={16} /> Clock In Shift</>}
            </button>
          ) : !todayRecord?.checkOut ? (
            <button
              id="checkout-btn"
              className="btn btn-danger btn-lg"
              style={{ minWidth: 200 }}
              onClick={handleCheckOut}
              disabled={actionLoading}
            >
              {actionLoading ? <span className="spinner" /> : <><LogOut size={16} /> Clock Out Shift</>}
            </button>
          ) : (
            <div className="badge badge-success" style={{ padding: '8px 14px', fontSize: '13px' }}>
              <Check size={14} /> Completed shift ({todayRecord.workHours} hrs)
            </div>
          )}
        </div>

        {/* Today's Shift Metrics */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Today's Shift Log</h3>
              <p className="card-subtitle">Real-time status</p>
            </div>
            <Clock size={16} className="text-muted" />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div className="flex justify-between items-center" style={{ padding: '8px 0', borderBottom: '1px solid var(--border-color-light)' }}>
              <span className="text-xs text-muted">Status</span>
              <span>{todayRecord ? <StatusBadge status={todayRecord.status} /> : <span className="text-muted text-xs">Unmarked</span>}</span>
            </div>
            <div className="flex justify-between items-center" style={{ padding: '8px 0', borderBottom: '1px solid var(--border-color-light)' }}>
              <span className="text-xs text-muted">Clock In</span>
              <span className="text-sm font-medium text-primary">{todayRecord?.checkIn || '—'}</span>
            </div>
            <div className="flex justify-between items-center" style={{ padding: '8px 0', borderBottom: '1px solid var(--border-color-light)' }}>
              <span className="text-xs text-muted">Clock Out</span>
              <span className="text-sm font-medium text-primary">{todayRecord?.checkOut || '—'}</span>
            </div>
            <div className="flex justify-between items-center" style={{ padding: '8px 0' }}>
              <span className="text-xs text-muted">Calculated Hours</span>
              <span className="text-sm font-bold text-indigo">{todayRecord?.workHours ? `${todayRecord.workHours} hrs` : '0 hrs'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Attendance History Table */}
      <div className="card">
        <div className="card-header">
          <div>
            <h3 className="card-title">Attendance History</h3>
            <p className="card-subtitle">Detailed check-in logs</p>
          </div>
          <div className="flex gap-2">
            <button
              className={`btn btn-sm ${view === 'week' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => { setView('week'); setLoading(true); }}
            >
              This Week
            </button>
            <button
              className={`btn btn-sm ${view === 'month' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => { setView('month'); setLoading(true); }}
            >
              This Month
            </button>
          </div>
        </div>

        {loading ? (
          <div className="loading-page">
            <div className="spinner-lg" />
          </div>
        ) : records.length === 0 ? (
          <EmptyState
            title="No attendance records"
            description="You have no recorded shifts for this timeframe."
            icon={CalendarCheck}
          />
        ) : (
          <div className="table-container" style={{ border: 'none', boxShadow: 'none' }}>
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Day</th>
                  <th>Clock In</th>
                  <th>Clock Out</th>
                  <th>Total Hours</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {records.map((rec) => (
                  <tr key={rec._id}>
                    <td className="font-medium text-primary">{rec.date}</td>
                    <td className="text-secondary">{new Date(rec.date).toLocaleDateString('en-IN', { weekday: 'short' })}</td>
                    <td className="text-primary">{rec.checkIn || '—'}</td>
                    <td className="text-secondary">{rec.checkOut || '—'}</td>
                    <td className="font-semibold text-primary">{rec.workHours ? `${rec.workHours} hrs` : '—'}</td>
                    <td>
                      <StatusBadge status={rec.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
}
