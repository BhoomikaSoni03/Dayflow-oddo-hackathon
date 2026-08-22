import { useState } from 'react';
import Layout from '../../components/Layout';
import { notificationAPI } from '../../services/api';
import { Bell, Send, Check, AlertCircle } from 'lucide-react';

export default function AdminNotifications() {
  const [form, setForm] = useState({
    title: '',
    message: '',
    targetRole: '', // '' = all, 'EMPLOYEE', 'ADMIN'
  });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ text: '', type: '' });

  const handleBroadcast = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await notificationAPI.broadcast(form);
      setMsg({ text: res.data.message || 'Announcement broadcasted successfully!', type: 'success' });
      setForm({ title: '', message: '', targetRole: '' });
    } catch (err) {
      setMsg({ text: err.response?.data?.message || 'Broadcast failed', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title="Announcements">
      <div className="page-header">
        <div>
          <h2 className="page-title">Workforce Announcements</h2>
          <p className="page-subtitle">Dispatch real-time in-system notices to departments or all staff members.</p>
        </div>
      </div>

      {msg.text && (
        <div className={`alert alert-${msg.type}`} onClick={() => setMsg({ text: '', type: '' })}>
          {msg.type === 'success' ? <Check size={16} /> : <AlertCircle size={16} />}
          <span>{msg.text}</span>
        </div>
      )}

      <div className="card" style={{ maxWidth: 620, margin: '0 auto' }}>
        <div className="card-header">
          <div>
            <h3 className="card-title">Compose Notice</h3>
            <p className="card-subtitle">Deliver alerts directly to user dashboards</p>
          </div>
          <Bell size={18} className="text-muted" />
        </div>

        <form onSubmit={handleBroadcast}>
          <div className="form-group">
            <label className="form-label">Audience</label>
            <select
              className="form-select"
              value={form.targetRole}
              onChange={(e) => setForm({ ...form, targetRole: e.target.value })}
            >
              <option value="">All Staff (Employees & Administrators)</option>
              <option value="EMPLOYEE">Employees Only</option>
              <option value="ADMIN">HR & Administrators Only</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Announcement Headline</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Office Holiday Notice, Policy Update..."
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Announcement Content</label>
            <textarea
              className="form-textarea"
              placeholder="Provide complete details of the announcement here..."
              rows={4}
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary btn-full btn-lg mt-4" disabled={loading}>
            {loading ? <span className="spinner" /> : <><Send size={16} /> Dispatch Announcement</>}
          </button>
        </form>
      </div>
    </Layout>
  );
}
