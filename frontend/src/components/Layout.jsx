import { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import NotificationPanel from './NotificationPanel';
import Avatar from './Avatar';
import { notificationAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Bell, Search, ChevronDown } from 'lucide-react';

export default function Layout({ children, title }) {
  const { user } = useAuth();
  const [showNotif, setShowNotif] = useState(false);
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    notificationAPI
      .getMyNotifications()
      .then(({ data }) => setUnread(data.unreadCount || 0))
      .catch(() => {});
  }, []);

  const displayName = user?.firstName
    ? `${user.firstName} ${user.lastName || ''}`.trim()
    : user?.email || 'User';

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <header className="topbar">
          <div className="topbar-left">
            <h1 className="topbar-title">{title}</h1>
          </div>

          <div className="topbar-right">
            {/* Global Search Input */}
            <div className="header-search">
              <Search size={14} className="header-search-icon" />
              <input
                type="text"
                placeholder="Search..."
                className="header-search-input"
              />
            </div>

            {/* Notification Trigger */}
            <div style={{ position: 'relative' }}>
              <button
                id="notification-btn"
                className="icon-btn"
                onClick={() => setShowNotif((s) => !s)}
                aria-label="Notifications"
              >
                <Bell size={18} />
                {unread > 0 && (
                  <span className="icon-btn-badge">
                    {unread > 9 ? '9+' : unread}
                  </span>
                )}
              </button>
              {showNotif && <NotificationPanel onClose={() => setShowNotif(false)} />}
            </div>

            {/* User Avatar Summary in Header */}
            <div className="flex items-center gap-2" style={{ paddingLeft: '8px', borderLeft: '1px solid var(--border-color)' }}>
              <Avatar name={displayName} size="sm" src={user?.profilePicture} />
              <span className="text-xs font-semibold text-primary" style={{ maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {displayName}
              </span>
            </div>
          </div>
        </header>

        <main className="page-container">
          {children}
        </main>
      </div>
    </div>
  );
}
