const Notification = require('../models/Notification');
const User = require('../models/User');

// GET /api/notifications/me
const getMyNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ recipientId: req.user._id }).sort({ createdAt: -1 }).limit(50);
    const unreadCount = await Notification.countDocuments({ recipientId: req.user._id, isRead: false });
    res.json({ success: true, count: notifications.length, unreadCount, notifications });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PATCH /api/notifications/:id/read
const markAsRead = async (req, res) => {
  try {
    await Notification.findOneAndUpdate(
      { _id: req.params.id, recipientId: req.user._id },
      { isRead: true }
    );
    res.json({ success: true, message: 'Notification marked as read' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PATCH /api/notifications/read-all
const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany({ recipientId: req.user._id, isRead: false }, { isRead: true });
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/notifications/broadcast — Admin
const broadcastNotification = async (req, res) => {
  try {
    const { title, message, targetRole } = req.body;
    const filter = targetRole ? { role: targetRole } : {};
    const users = await User.find(filter).select('_id');

    await Promise.all(
      users.map((u) =>
        Notification.create({ recipientId: u._id, title, message, type: 'SYSTEM' })
      )
    );
    res.json({ success: true, message: `Notification sent to ${users.length} users` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getMyNotifications, markAsRead, markAllAsRead, broadcastNotification };
