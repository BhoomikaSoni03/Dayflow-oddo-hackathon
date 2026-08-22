import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import Avatar from '../../components/Avatar';
import StatusBadge from '../../components/StatusBadge';
import { profileAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Edit3, Check, AlertCircle, User, Briefcase, Mail, Phone, MapPin, Calendar } from 'lucide-react';

export default function EmployeeProfile() {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ text: '', type: '' });

  useEffect(() => {
    profileAPI
      .getMyProfile()
      .then(({ data }) => {
        setProfile(data.profile);
        setForm({
          phoneNumber: data.profile.phoneNumber || '',
          address: data.profile.address || '',
          profilePicture: data.profile.profilePicture || '',
        });
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setMsg({ text: '', type: '' });
    try {
      const { data } = await profileAPI.updateMyProfile(form);
      setProfile(data.profile);
      updateUser({ firstName: data.profile.firstName, lastName: data.profile.lastName });
      setEditing(false);
      setMsg({ text: 'Profile updated successfully.', type: 'success' });
    } catch (err) {
      setMsg({ text: err.response?.data?.message || 'Update failed', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const fullName = profile ? `${profile.firstName} ${profile.lastName}` : user?.email || 'User';

  if (loading) {
    return (
      <Layout title="Profile">
        <div className="loading-page">
          <div className="spinner-lg" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="My Profile">
      <div className="page-header">
        <div>
          <h2 className="page-title">Employee Profile</h2>
          <p className="page-subtitle">View and maintain your personal and professional records.</p>
        </div>
      </div>

      {msg.text && (
        <div className={`alert alert-${msg.type}`} onClick={() => setMsg({ text: '', type: '' })}>
          {msg.type === 'success' ? <Check size={16} /> : <AlertCircle size={16} />}
          <span>{msg.text}</span>
        </div>
      )}

      {/* Profile Banner */}
      <div className="card mb-6" style={{ padding: 'var(--space-6)' }}>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <Avatar name={fullName} size="lg" src={profile?.profilePicture} />
            <div>
              <h3 className="text-xl font-bold text-primary">{fullName}</h3>
              <div className="flex items-center gap-3 text-secondary text-xs mt-1 flex-wrap">
                <span className="flex items-center gap-1">
                  <Briefcase size={13} className="text-muted" /> {profile?.designation}
                </span>
                <span>·</span>
                <span>{profile?.department}</span>
                <span>·</span>
                <StatusBadge status={profile?.employmentType || 'FULL_TIME'} />
              </div>
            </div>
          </div>

          <div>
            {!editing ? (
              <button className="btn btn-secondary btn-sm" onClick={() => setEditing(true)}>
                <Edit3 size={14} /> Edit Contact Details
              </button>
            ) : (
              <div className="flex gap-2">
                <button className="btn btn-secondary btn-sm" onClick={() => setEditing(false)}>
                  Cancel
                </button>
                <button className="btn btn-primary btn-sm" onClick={handleSave} disabled={saving}>
                  {saving ? <span className="spinner" /> : <><Check size={14} /> Save Changes</>}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Grid: Personal Info + Job Info */}
      <div className="grid-2">
        {/* Personal Details */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Personal & Contact Info</h3>
              <p className="card-subtitle">Self-service editable details</p>
            </div>
            <User size={16} className="text-muted" />
          </div>

          <InfoRow label="First Name" value={profile?.firstName} />
          <InfoRow label="Last Name" value={profile?.lastName} />
          <InfoRow
            label="Date of Birth"
            value={profile?.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString('en-IN') : '—'}
          />

          {editing ? (
            <div className="mt-4">
              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input
                  className="form-input"
                  placeholder="+91 98765 43210"
                  value={form.phoneNumber}
                  onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Residential Address</label>
                <textarea
                  className="form-textarea"
                  placeholder="Your residential address in India..."
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                />
              </div>
            </div>
          ) : (
            <>
              <InfoRow label="Phone Number" value={profile?.phoneNumber || '—'} />
              <InfoRow label="Address" value={profile?.address || '—'} />
            </>
          )}
        </div>

        {/* Job Details */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Employment Information</h3>
              <p className="card-subtitle">Official organization assignments</p>
            </div>
            <Briefcase size={16} className="text-muted" />
          </div>

          <InfoRow label="Employee ID" value={user?.employeeId} />
          <InfoRow label="Official Email" value={user?.email} />
          <InfoRow label="Department" value={profile?.department} />
          <InfoRow label="Designation" value={profile?.designation} />
          <InfoRow label="Employment Type" value={profile?.employmentType?.replace('_', ' ')} />
          <InfoRow
            label="Joining Date"
            value={profile?.joiningDate ? new Date(profile.joiningDate).toLocaleDateString('en-IN') : '—'}
          />
        </div>
      </div>
    </Layout>
  );
}

function InfoRow({ label, value }) {
  return (
    <div
      className="flex justify-between items-start"
      style={{
        padding: '10px 0',
        borderBottom: '1px solid var(--border-color-light)',
      }}
    >
      <span className="text-xs text-muted" style={{ flexShrink: 0 }}>
        {label}
      </span>
      <span className="text-sm font-medium text-primary" style={{ textAlign: 'right' }}>
        {value || '—'}
      </span>
    </div>
  );
}
