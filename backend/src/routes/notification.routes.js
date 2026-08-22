const router = require('express').Router();
const { protect, requireVerified } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');
const { getMyNotifications, markAsRead, markAllAsRead, broadcastNotification } = require('../controllers/notification.controller');

router.use(protect, requireVerified);

router.get('/me', getMyNotifications);
router.patch('/read-all', markAllAsRead);
router.patch('/:id/read', markAsRead);
router.post('/broadcast', requireRole('ADMIN'), broadcastNotification);

module.exports = router;
