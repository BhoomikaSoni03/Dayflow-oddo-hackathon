import { useState, useRef, useEffect } from 'react';
import { notificationAPI } from '../services/api';
import { Bell, CalendarDays, Wallet, Clock, Check, Info } from 'lucide-react';

export default function NotificationPanel({ onClose }) {
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);
  const ref = useRef();

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const { data } = await notificationAPI.getMyNotifications();
        setNotifications(data.notifications || []);
        setUnread(data.unreadCount || 0);
      } catch {
        // fail gracefully
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const markAsRead = async (id) => {
    await notificationAPI.markAsRead(id);
    setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, isRead: true } : n)));
    setUnread((u) => Math.max(0, u - 1));
  };

  const markAllRead = async () => {
    await notificationAPI.markAllAsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnread(0);
  };

  const timeAgo = (date) => {
    const diff = Date.now() - new Date(date);
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  const getIcon = (type) => {
    switch (type) {
      case 'LEAVE':
        return <CalendarDays size={16} className="text-indigo" />;
      case 'PAYROLL':
        return <Wallet size={16} className="text-success" />;
      case 'ATTENDANCE':
        return <Clock size={16} className="text-warning" />;
      default:
        return <Info size={16} className="text-secondary" />;
    }
  };

  return (
    <div className="notif-panel" ref={ref}>
      <div className="notif-header">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-primary text-sm">Notifications</span>
          {unread > 0 && (
            <span className="badge badge-primary" style={{ padding: '2px 6px', fontSize: '10px' }}>
              {unread} new
            </span>
          )}
        </div>
        {unread > 0 && (
          <button className="btn btn-ghost btn-sm" onClick={markAllRead} style={{ fontSize: '11px', padding: '2px 6px' }}>
            <Check size={12} /> Mark all read
          </button>
        )}
      </div>

      {loading ? (
        <div style={{ padding: '32px', textAlign: 'center' }}>
          <div className="spinner" style={{ color: 'var(--primary-600)' }} />
        </div>
      ) : notifications.length === 0 ? (
        <div style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <Bell size={24} style={{ margin: '0 auto 8px', opacity: 0.5 }} />
          <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)' }}>No notifications</div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>You're all caught up!</div>
        </div>
      ) : (
        notifications.map((n) => (
          <div
            key={n._id}
            className={`notif-item ${!n.isRead ? 'unread' : ''}`}
            onClick={() => !n.isRead && markAsRead(n._id)}
          >
            <div style={{ marginTop: '2px', flexShrink: 0 }}>
              {getIcon(n.type)}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="notif-title">{n.title}</div>
              <div className="notif-message">{n.message}</div>
              <div className="notif-time">{timeAgo(n.createdAt)}</div>
            </div>
            {!n.isRead && (
              <div
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: 'var(--primary-600)',
                  flexShrink: 0,
                  marginTop: 6,
                }}
              />
            )}
          </div>
        ))
      )}
    </div>
  );
}
