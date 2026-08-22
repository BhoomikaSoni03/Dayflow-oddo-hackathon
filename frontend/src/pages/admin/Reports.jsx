import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import StatusBadge from '../../components/StatusBadge';
import EmptyState from '../../components/EmptyState';
import { reportAPI } from '../../services/api';
import { BarChart3, CalendarCheck, CalendarDays, Wallet } from 'lucide-react';

export default function AdminReports() {
  const [reportType, setReportType] = useState('attendance'); // attendance | leave | payroll
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchReport = async () => {
    setLoading(true);
    try {
      if (reportType === 'attendance') {
        const res = await reportAPI.getAttendanceReport();
        setData(res.data);
      } else if (reportType === 'leave') {
        const res = await reportAPI.getLeaveReport();
        setData(res.data);
      } else if (reportType === 'payroll') {
        const res = await reportAPI.getPayrollReport();
        setData(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [reportType]);

  return (
    <Layout title="Reports & Analytics">
      <div className="page-header">
        <div>
          <h2 className="page-title">HR Business Intelligence</h2>
          <p className="page-subtitle">Examine workforce metrics, attendance audits, leave allocations, and payroll summaries.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="card mb-6" style={{ padding: 'var(--space-4)' }}>
        <div className="flex justify-between items-center flex-wrap gap-4">
          <span className="text-sm font-semibold text-primary">Report Type</span>
          <div className="flex gap-2">
            <button
              className={`btn btn-sm ${reportType === 'attendance' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setReportType('attendance')}
            >
              <CalendarCheck size={14} /> Attendance Audit
            </button>
            <button
              className={`btn btn-sm ${reportType === 'leave' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setReportType('leave')}
            >
              <CalendarDays size={14} /> Leave Report
            </button>
            <button
              className={`btn btn-sm ${reportType === 'payroll' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setReportType('payroll')}
            >
              <Wallet size={14} /> Payroll Report
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="loading-page">
          <div className="spinner-lg" />
        </div>
      ) : reportType === 'attendance' ? (
        <div>
          {/* Summary KPIs */}
          <div className="stat-grid mb-6">
            <div className="stat-card">
              <span className="stat-card-label">Total Logs</span>
              <div className="stat-card-value mt-2">{data?.summary?.total || 0}</div>
            </div>
            <div className="stat-card">
              <span className="stat-card-label">Present Logs</span>
              <div className="stat-card-value text-success mt-2">{data?.summary?.present || 0}</div>
            </div>
            <div className="stat-card">
              <span className="stat-card-label">Half-Day Logs</span>
              <div className="stat-card-value text-warning mt-2">{data?.summary?.halfDay || 0}</div>
            </div>
            <div className="stat-card">
              <span className="stat-card-label">Absent Logs</span>
              <div className="stat-card-value text-danger mt-2">{data?.summary?.absent || 0}</div>
            </div>
          </div>

          {data?.records?.length === 0 ? (
            <EmptyState
              title="No attendance records"
              description="No attendance data is available for reporting."
              icon={CalendarCheck}
            />
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Employee</th>
                    <th>Check In</th>
                    <th>Check Out</th>
                    <th>Hours</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.records?.map((r) => (
                    <tr key={r._id}>
                      <td className="text-secondary font-medium">{r.date}</td>
                      <td>
                        <div className="font-semibold text-primary text-sm">{r.userId?.employeeId}</div>
                        <div className="text-xs text-muted">{r.userId?.email}</div>
                      </td>
                      <td className="text-secondary">{r.checkIn || '—'}</td>
                      <td className="text-secondary">{r.checkOut || '—'}</td>
                      <td className="font-medium text-primary">{r.workHours || 0} hrs</td>
                      <td>
                        <StatusBadge status={r.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : reportType === 'leave' ? (
        <div>
          <div className="card mb-4" style={{ padding: '12px 16px' }}>
            <span className="text-sm font-semibold text-primary">
              Leave Audit: {data?.count || 0} Total Applications Logged
            </span>
          </div>

          {data?.leaves?.length === 0 ? (
            <EmptyState
              title="No leave records"
              description="No leave applications logged in the system."
              icon={CalendarDays}
            />
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Leave Type</th>
                    <th>Days</th>
                    <th>Date Range</th>
                    <th>Status</th>
                    <th>Reviewed By</th>
                    <th>Comments</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.leaves?.map((l) => (
                    <tr key={l._id}>
                      <td className="font-semibold text-primary text-sm">{l.employeeId?.employeeId}</td>
                      <td>
                        <StatusBadge status="INFO" label={l.leaveType} />
                      </td>
                      <td className="font-semibold text-primary">{l.durationDays} day(s)</td>
                      <td className="text-secondary text-xs">
                        {new Date(l.startDate).toLocaleDateString('en-IN')} → {new Date(l.endDate).toLocaleDateString('en-IN')}
                      </td>
                      <td>
                        <StatusBadge status={l.status} />
                      </td>
                      <td className="text-xs text-secondary">{l.reviewedBy?.employeeId || '—'}</td>
                      <td className="text-xs text-muted">{l.hrComments || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        <div>
          <div className="stat-grid mb-6">
            <div className="stat-card">
              <span className="stat-card-label">Total Cumulative Net Disbursed</span>
              <div className="stat-card-value text-indigo mt-2">
                ₹{Number(data?.totalNetPay || 0).toLocaleString('en-IN')}
              </div>
            </div>
            <div className="stat-card">
              <span className="stat-card-label">Payslips Issued</span>
              <div className="stat-card-value mt-2">{data?.count || 0}</div>
            </div>
          </div>

          {data?.records?.length === 0 ? (
            <EmptyState
              title="No payroll logs"
              description="No monthly payroll transactions recorded."
              icon={Wallet}
            />
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Period</th>
                    <th>Gross Pay</th>
                    <th>Deductions</th>
                    <th>Net Disbursed</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.records?.map((r) => (
                    <tr key={r._id}>
                      <td>
                        <div className="font-semibold text-primary text-sm">{r.userId?.employeeId}</div>
                        <div className="text-xs text-muted">{r.userId?.email}</div>
                      </td>
                      <td className="text-secondary">{r.month}/{r.year}</td>
                      <td className="text-secondary">₹{Number(r.grossPay || 0).toLocaleString('en-IN')}</td>
                      <td className="text-danger">-₹{Number(r.totalDeductions || 0).toLocaleString('en-IN')}</td>
                      <td className="font-bold text-primary">₹{Number(r.netPay || 0).toLocaleString('en-IN')}</td>
                      <td>
                        <StatusBadge status={r.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </Layout>
  );
}
