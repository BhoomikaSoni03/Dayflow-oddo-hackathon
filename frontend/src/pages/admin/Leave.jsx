import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import StatusBadge from '../../components/StatusBadge';
import EmptyState from '../../components/EmptyState';
import { leaveAPI } from '../../services/api';
import { CalendarDays, Check, X, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

export default function AdminLeave() {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [reviewModal, setReviewModal] = useState(null);
  const [hrComments, setHrComments] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [msg, setMsg] = useState({ text: '', type: '' });

  const fetchLeaves = async () => {
    setLoading(true);
    try {
      const res = await leaveAPI.getAllLeaves(filterStatus ? { status: filterStatus } : {});
      setLeaves(res.data.leaves || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, [filterStatus]);

  const handleReview = async (status) => {
    if (!reviewModal) return;
    setActionLoading(true);
    try {
      await leaveAPI.reviewLeave(reviewModal._id, { status, hrComments });
      setMsg({ text: `Leave application marked as ${status.toLowerCase()}.`, type: 'success' });
      setReviewModal(null);
      setHrComments('');
      fetchLeaves();
    } catch (err) {
      setMsg({ text: err.response?.data?.message || 'Failed to review leave', type: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <Layout title="Leave Requests">
      <div className="page-header">
        <div>
          <h2 className="page-title">Leave Approvals Queue</h2>
          <p className="page-subtitle">Review employee time-off applications, approve or reject, and attach HR audit remarks.</p>
        </div>
      </div>

      {msg.text && (
        <div className={`alert alert-${msg.type}`} onClick={() => setMsg({ text: '', type: '' })}>
          {msg.type === 'success' ? <Check size={16} /> : <AlertCircle size={16} />}
          <span>{msg.text}</span>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="card mb-6" style={{ padding: 'var(--space-4)' }}>
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-primary">Applications Queue</span>
            <span className="badge badge-neutral">{leaves.length}</span>
          </div>

          <div className="flex gap-2">
            {[
              { id: '', label: 'All Requests' },
              { id: 'PENDING', label: 'Pending' },
              { id: 'APPROVED', label: 'Approved' },
              { id: 'REJECTED', label: 'Rejected' },
            ].map((tab) => (
              <button
                key={tab.id}
                className={`btn btn-sm ${filterStatus === tab.id ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setFilterStatus(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="loading-page">
          <div className="spinner-lg" />
        </div>
      ) : leaves.length === 0 ? (
        <EmptyState
          title="No leave requests found"
          description="There are no applications matching the selected status filter."
          icon={CalendarDays}
        />
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Employee</th>
                <th>Leave Type</th>
                <th>Duration</th>
                <th>Dates</th>
                <th>Reason</th>
                <th>Status</th>
                <th>HR Comments</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {leaves.map((l) => (
                <tr key={l._id}>
                  <td>
                    <div>
                      <div className="font-semibold text-primary text-sm">
                        {l.employeeId?.employeeId || '—'}
                      </div>
                      <div className="text-xs text-muted">{l.employeeId?.email}</div>
                    </div>
                  </td>
                  <td>
                    <StatusBadge status="INFO" label={`${l.leaveType} Leave`} />
                  </td>
                  <td className="font-semibold text-primary">{l.durationDays} day(s)</td>
                  <td className="text-secondary text-xs">
                    {new Date(l.startDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })} →{' '}
                    {new Date(l.endDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td style={{ maxWidth: 220, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {l.reason}
                  </td>
                  <td>
                    <StatusBadge status={l.status} />
                  </td>
                  <td className="text-xs text-muted">{l.hrComments || '—'}</td>
                  <td>
                    {l.status === 'PENDING' ? (
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => {
                          setReviewModal(l);
                          setHrComments('');
                        }}
                      >
                        Review
                      </button>
                    ) : (
                      <span className="text-xs text-muted font-medium">Reviewed</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Review Modal */}
      {reviewModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3 className="modal-title">Review Leave Application</h3>
              <button className="modal-close" onClick={() => setReviewModal(null)}>
                <X size={18} />
              </button>
            </div>

            <div
              className="card mb-4"
              style={{ background: 'var(--bg-app)', border: '1px solid var(--border-color)' }}
            >
              <div className="text-sm text-secondary">
                <strong className="text-primary">Employee:</strong> {reviewModal.employeeId?.employeeId} ({reviewModal.employeeId?.email})
              </div>
              <div className="text-sm text-secondary mt-2">
                <strong className="text-primary">Leave Type:</strong> {reviewModal.leaveType} ({reviewModal.durationDays} days)
              </div>
              <div className="text-sm text-secondary mt-2">
                <strong className="text-primary">Dates:</strong>{' '}
                {new Date(reviewModal.startDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })} to{' '}
                {new Date(reviewModal.endDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
              </div>
              <div className="text-sm text-secondary mt-2">
                <strong className="text-primary">Reason:</strong> {reviewModal.reason}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">HR Remarks / Feedback</label>
              <textarea
                className="form-textarea"
                placeholder="Optional notes or feedback for the employee..."
                value={hrComments}
                onChange={(e) => setHrComments(e.target.value)}
              />
            </div>

            <div className="flex gap-3 justify-end mt-6">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setReviewModal(null)}
                disabled={actionLoading}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={() => handleReview('REJECTED')}
                disabled={actionLoading}
              >
                <XCircle size={15} /> Reject
              </button>
              <button
                type="button"
                className="btn btn-success"
                onClick={() => handleReview('APPROVED')}
                disabled={actionLoading}
              >
                <CheckCircle2 size={15} /> Approve
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
