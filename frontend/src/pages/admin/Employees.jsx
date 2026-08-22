import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import Avatar from '../../components/Avatar';
import StatusBadge from '../../components/StatusBadge';
import EmptyState from '../../components/EmptyState';
import { profileAPI } from '../../services/api';
import { Search, Edit3, X, Users, Check, AlertCircle } from 'lucide-react';

export default function AdminEmployees() {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ text: '', type: '' });

  const fetchProfiles = async () => {
    try {
      const res = await profileAPI.getAllProfiles();
      setProfiles(res.data.profiles || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfiles();
  }, []);

  const handleOpenEdit = (p) => {
    setSelectedUser(p);
    setEditForm({
      firstName: p.firstName || '',
      lastName: p.lastName || '',
      department: p.department || '',
      designation: p.designation || '',
      employmentType: p.employmentType || 'FULL_TIME',
      phoneNumber: p.phoneNumber || '',
      address: p.address || '',
    });
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!selectedUser?.userId?._id) return;
    setSaving(true);
    try {
      await profileAPI.updateProfileById(selectedUser.userId._id, editForm);
      setMsg({ text: 'Employee details updated successfully.', type: 'success' });
      setSelectedUser(null);
      fetchProfiles();
    } catch (err) {
      setMsg({ text: err.response?.data?.message || 'Failed to update employee', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const filtered = profiles.filter((p) => {
    const q = search.toLowerCase();
    const name = `${p.firstName} ${p.lastName}`.toLowerCase();
    const empId = p.userId?.employeeId?.toLowerCase() || '';
    const email = p.userId?.email?.toLowerCase() || '';
    const dept = p.department?.toLowerCase() || '';
    return name.includes(q) || empId.includes(q) || email.includes(q) || dept.includes(q);
  });

  return (
    <Layout title="Employees">
      <div className="page-header">
        <div>
          <h2 className="page-title">Workforce Directory</h2>
          <p className="page-subtitle">View and manage employee profile records, designations, and contacts.</p>
        </div>
      </div>

      {msg.text && (
        <div className={`alert alert-${msg.type}`} onClick={() => setMsg({ text: '', type: '' })}>
          {msg.type === 'success' ? <Check size={16} /> : <AlertCircle size={16} />}
          <span>{msg.text}</span>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="card mb-6" style={{ padding: 'var(--space-4)' }}>
        <div className="flex justify-between items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-primary">All Employees</span>
            <span className="badge badge-neutral">{profiles.length}</span>
          </div>

          <div style={{ position: 'relative', width: 280 }}>
            <Search size={14} className="header-search-icon" />
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '32px', height: '36px' }}
              placeholder="Search by name, ID, department..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="loading-page">
          <div className="spinner-lg" />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No employees found"
          description="No employee records match your search filter."
          icon={Users}
        />
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Employee</th>
                <th>Employee ID</th>
                <th>Work Email</th>
                <th>Department</th>
                <th>Designation</th>
                <th>Type</th>
                <th>Role</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p._id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <Avatar
                        name={`${p.firstName} ${p.lastName}`}
                        size="sm"
                        src={p.profilePicture}
                      />
                      <div>
                        <div className="font-semibold text-primary text-sm">
                          {p.firstName} {p.lastName}
                        </div>
                        <div className="text-xs text-muted">{p.phoneNumber || '—'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="text-secondary font-medium">{p.userId?.employeeId || '—'}</td>
                  <td className="text-secondary">{p.userId?.email || '—'}</td>
                  <td>{p.department || 'General'}</td>
                  <td>{p.designation || 'Employee'}</td>
                  <td>
                    <StatusBadge status={p.employmentType || 'FULL_TIME'} />
                  </td>
                  <td>
                    <StatusBadge status={p.userId?.role === 'ADMIN' ? 'PRIMARY' : 'NEUTRAL'} label={p.userId?.role} />
                  </td>
                  <td>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => handleOpenEdit(p)}
                    >
                      <Edit3 size={13} /> Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit Employee Modal */}
      {selectedUser && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3 className="modal-title">
                Edit Employee: {selectedUser.firstName} {selectedUser.lastName}
              </h3>
              <button className="modal-close" onClick={() => setSelectedUser(null)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit}>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">First Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={editForm.firstName}
                    onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Last Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={editForm.lastName}
                    onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Department</label>
                  <input
                    type="text"
                    className="form-input"
                    value={editForm.department}
                    onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Designation</label>
                  <input
                    type="text"
                    className="form-input"
                    value={editForm.designation}
                    onChange={(e) => setEditForm({ ...editForm, designation: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Employment Type</label>
                <select
                  className="form-select"
                  value={editForm.employmentType}
                  onChange={(e) => setEditForm({ ...editForm, employmentType: e.target.value })}
                >
                  <option value="FULL_TIME">Full Time</option>
                  <option value="PART_TIME">Part Time</option>
                  <option value="CONTRACT">Contract</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input
                  type="text"
                  className="form-input"
                  value={editForm.phoneNumber}
                  onChange={(e) => setEditForm({ ...editForm, phoneNumber: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Address</label>
                <textarea
                  className="form-textarea"
                  value={editForm.address}
                  onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                />
              </div>

              <div className="flex gap-3 justify-end mt-6">
                <button type="button" className="btn btn-secondary" onClick={() => setSelectedUser(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? <span className="spinner" /> : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}
