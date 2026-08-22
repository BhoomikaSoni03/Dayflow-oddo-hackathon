import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import StatusBadge from '../../components/StatusBadge';
import EmptyState from '../../components/EmptyState';
import { attendanceAPI } from '../../services/api';
import { CalendarCheck, Calendar, UserCheck, Clock, UserX, CalendarDays } from 'lucide-react';

export default function AdminAttendance() {
  const [records, setRecords] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const [recRes, sumRes] = await Promise.allSettled([
        attendanceAPI.getAllAttendance({ date: selectedDate }),
        attendanceAPI.getTodaySummary(),
      ]);
      if (recRes.status === 'fulfilled') setRecords(recRes.value.data.records || []);
      if (sumRes.status === 'fulfilled') setSummary(sumRes.value.data.summary || null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, [selectedDate]);

  return (
    <Layout title="Attendance">
      <div className="page-header">
        <div>
          <h2 className="page-title">Attendance Monitoring</h2>
          <p className="page-subtitle">Track real-time check-in logs, work hours, and daily workforce presence.</p>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-card-top">
            <span className="stat-card-label">Present Today</span>
            <div className="stat-card-icon-wrapper green">
              <UserCheck size={16} />
            </div>
          </div>
          <div className="stat-card-value">{summary?.present || 0}</div>
          <div className="stat-card-meta">
            <span>Clocked in today</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-top">
            <span className="stat-card-label">Half Day</span>
            <div className="stat-card-icon-wrapper amber">
              <Clock size={16} />
            </div>
          </div>
          <div className="stat-card-value">{summary?.halfDay || 0}</div>
          <div className="stat-card-meta">
            <span>Partial shifts recorded</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-top">
            <span className="stat-card-label">On Leave</span>
            <div className="stat-card-icon-wrapper blue">
              <CalendarDays size={16} />
            </div>
          </div>
          <div className="stat-card-value">{summary?.leave || 0}</div>
          <div className="stat-card-meta">
            <span>Approved absence</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-top">
            <span className="stat-card-label">Absent / Unmarked</span>
            <div className="stat-card-icon-wrapper red">
              <UserX size={16} />
            </div>
          </div>
          <div className="stat-card-value">{summary?.absent || 0}</div>
          <div className="stat-card-meta">
            <span>No check-in record</span>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="card mb-6" style={{ padding: 'var(--space-4)' }}>
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-primary">Daily Attendance Log</span>
            <span className="badge badge-neutral">{records.length} records</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Calendar size={14} className="text-muted" />
              <input
                type="date"
                className="form-input"
                style={{ width: 'auto', height: '36px' }}
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
            >
              Today
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="loading-page">
          <div className="spinner-lg" />
        </div>
      ) : records.length === 0 ? (
        <EmptyState
          title={`No records for ${selectedDate}`}
          description="No employee attendance entries have been recorded for the selected date."
          icon={CalendarCheck}
        />
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Employee ID</th>
                <th>Email</th>
                <th>Date</th>
                <th>Check In</th>
                <th>Check Out</th>
                <th>Work Hours</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r) => (
                <tr key={r._id}>
                  <td className="font-semibold text-primary">{r.userId?.employeeId || '—'}</td>
                  <td className="text-secondary">{r.userId?.email || '—'}</td>
                  <td className="text-secondary">{r.date}</td>
                  <td className="font-medium text-primary">{r.checkIn || '—'}</td>
                  <td className="text-secondary">{r.checkOut || '—'}</td>
                  <td className="text-primary font-medium">{r.workHours ? `${r.workHours} hrs` : '—'}</td>
                  <td>
                    <StatusBadge status={r.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Layout>
  );
}
