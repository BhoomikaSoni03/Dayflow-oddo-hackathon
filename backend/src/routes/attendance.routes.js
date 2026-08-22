const router = require('express').Router();
const { protect, requireVerified } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');
const {
  checkIn,
  checkOut,
  getMyAttendance,
  getAllAttendance,
  getTodaySummary,
} = require('../controllers/attendance.controller');

router.use(protect, requireVerified);

router.post('/checkin', checkIn);
router.patch('/checkout', checkOut);
router.get('/me', getMyAttendance);
router.get('/today-summary', requireRole('ADMIN'), getTodaySummary);
router.get('/all', requireRole('ADMIN'), getAllAttendance);

module.exports = router;
