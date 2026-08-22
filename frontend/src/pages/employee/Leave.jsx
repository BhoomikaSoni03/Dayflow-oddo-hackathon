import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import StatusBadge from '../../components/StatusBadge';
import EmptyState from '../../components/EmptyState';
import { leaveAPI } from '../../services/api';
import { CalendarDays, Plus, Check, AlertCircle, Clock3, CheckCircle2, XCircle } from 'lucide-react';

const LEAVE_TYPES = ['PAID', 'SICK', 'UNPAID'];

export default function EmployeeLeave() {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ leaveType: 'PAID', startDate: '', endDate: '', reason: '' });
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState({ text: '', type: '' });

  const fetchLeaves = async () => {
    try {
      const { data } = await leaveAPI.getMyLeaves();
      setLeaves(data.leaves || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  const calcDuration = () => {
    if (!form.startDate || !form.endDate) return 0;
    const d = Math.ceil((new Date(form.endDate) - new Date(form.startDate)) / 86400000) + 1;
    return d > 0 ? d : 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (calcDuration() <= 0) return setMsg({ text: 'End date must be after or equal to start date', type: 'error' });
    setSubmitting(true);
    try {
      await leaveAPI.applyLeave(form);
      setMsg({ text: 'Leave request submitted successfully.', type: 'success' });
      setShowForm(false);
      setForm({ leaveType: 'PAID', startDate: '', endDate: '', reason: '' });
      fetchLeaves();
    } catch (err) {
      setMsg({ text: err.response?.data?.message || 'Submission failed', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout title="Time Off & Leave">
      <div className="page-header">
        <div>
          <h2 className="page-title">Leave Management</h2>
          <p className="page-subtitle">Submit leave applications, track approval status, and review HR comments.</p>
        </div>
      </div>

      {msg.text && (
        <div className={`alert alert-${msg.type}`} onClick={() => setMsg({ text: '', type: '' })}>
          {msg.type === 'success' ? <Check size={16} /> : <AlertCircle size={16} />}
          <span>{msg.text}</span>
        </div>
      )}

      {/* Stats */}
      <div className="stat-grid mb-6">
        <div className="stat-card">
          <div className="stat-card-top">
            <span className="stat-card-label">Pending</span>
            <div className="stat-card-icon-wrapper amber">
              <Clock3 size={16} />
            </div>
          </div>
          <div className="stat-card-value">{leaves.filter((l) => l.status === 'PENDING').length}</div>
          <div className="stat-card-meta">
            <span>Awaiting HR review</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-top">
            <span className="stat-card-label">Approved</span>
            <div className="stat-card-icon-wrapper green">
              <CheckCircle2 size={16} />
            </div>
          </div>
          <div className="stat-card-value">{leaves.filter((l) => l.status === 'APPROVED').length}</div>
          <div className="stat-card-meta">
            <span>Approved applications</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-top">
            <span className="stat-card-label">Rejected</span>
            <div className="stat-card-icon-wrapper red">
              <XCircle size={16} />
            </div>
          </div>
          <div className="stat-card-value">{leaves.filter((l) => l.status === 'REJECTED').length}</div>
          <div className="stat-card-meta">
            <span>Declined applications</span>
          </div>
        </div>
      </div>

      {/* Apply Form */}
      {showForm && (
        <div className="card mb-6">
          <div className="card-header">
            <div>
              <h3 className="card-title">Apply for Time Off</h3>
              <p className="card-subtitle">Select dates and provide reason for leave</p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Leave Category</label>
              <select
                className="form-select"
                value={form.leaveType}
                onChange={(e) => setForm({ ...form, leaveType: e.target.value })}
              >
                {LEAVE_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t} Leave
                  </option>
                ))}
              </select>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Start Date</label>
                <input
                  type="date"
                  className="form-input"
                  value={form.startDate}
                  onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">End Date</label>
                <input
                  type="date"
                  className="form-input"
                  value={form.endDate}
                  onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                  required
                />
              </div>
            </div>

            {calcDuration() > 0 && (
              <div
                className="badge badge-info mb-4"
                style={{ padding: '6px 12px', fontSize: '13px' }}
              >
                Calculated Duration: <strong>{calcDuration()} working day(s)</strong>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Reason / Details</label>
              <textarea
                className="form-textarea"
                placeholder="State the reason for your time-off request..."
                value={form.reason}
                onChange={(e) => setForm({ ...form, reason: e.target.value })}
                required
              />
            </div>

            <div className="flex gap-2 justify-end mt-4">
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </button>
              <button
                id="submit-leave-btn"
                type="submit"
                className="btn btn-primary btn-sm"
                disabled={submitting}
              >
                {submitting ? <span className="spinner" /> : 'Submit Application'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Leave List */}
      <div className="card">
        <div className="card-header">
          <div>
            <h3 className="card-title">My Leave History</h3>
            <p className="card-subtitle">List of all submitted requests</p>
          </div>
          {!showForm && (
            <button
              id="apply-leave-btn"
              className="btn btn-primary btn-sm"
              onClick={() => setShowForm(true)}
            >
              <Plus size={14} /> Apply for Leave
            </button>
          )}
        </div>

        {loading ? (
          <div className="loading-page">
            <div className="spinner-lg" />
          </div>
        ) : leaves.length === 0 ? (
          <EmptyState
            title="No leave applications yet"
            description="Click 'Apply for Leave' above to submit your first request."
            icon={CalendarDays}
          />
        ) : (
          <div className="table-container" style={{ border: 'none', boxShadow: 'none' }}>
            <table>
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Duration</th>
                  <th>Dates</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th>HR Comment</th>
                  <th>Submitted</th>
                </tr>
              </thead>
              <tbody>
                {leaves.map((l) => (
                  <tr key={l._id}>
                    <td>
                      <StatusBadge status="INFO" label={l.leaveType} />
                    </td>
                    <td className="font-semibold text-primary">{l.durationDays} day(s)</td>
                    <td className="text-secondary text-xs">
                      {new Date(l.startDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })} →{' '}
                      {new Date(l.endDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                    </td>
                    <td style={{ maxWidth: 180, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {l.reason}
                    </td>
                    <td>
                      <StatusBadge status={l.status} />
                    </td>
                    <td className="text-xs text-muted font-normal">{l.hrComments || '—'}</td>
                    <td className="text-xs text-muted">
                      {new Date(l.createdAt).toLocaleDateString('en-IN')}
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
