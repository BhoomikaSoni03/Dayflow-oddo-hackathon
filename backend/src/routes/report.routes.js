const router = require('express').Router();
const { protect, requireVerified } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');
const { getDashboard, getAttendanceReport, getLeaveReport, getPayrollReport } = require('../controllers/report.controller');

router.use(protect, requireVerified, requireRole('ADMIN'));

router.get('/dashboard', getDashboard);
router.get('/attendance', getAttendanceReport);
router.get('/leave', getLeaveReport);
router.get('/payroll', getPayrollReport);

module.exports = router;
