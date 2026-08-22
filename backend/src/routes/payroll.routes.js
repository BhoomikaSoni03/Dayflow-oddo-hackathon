const router = require('express').Router();
const { protect, requireVerified } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');
const {
  getMySalary,
  getMyPayrollRecords,
  getAllSalaries,
  upsertSalary,
  processPayroll,
  getAllPayrollRecords,
} = require('../controllers/payroll.controller');

router.use(protect, requireVerified);

router.get('/my-salary', getMySalary);
router.get('/my-records', getMyPayrollRecords);
router.get('/all-salaries', requireRole('ADMIN'), getAllSalaries);
router.get('/all-records', requireRole('ADMIN'), getAllPayrollRecords);
router.put('/salary/:userId', requireRole('ADMIN'), upsertSalary);
router.post('/process/:userId', requireRole('ADMIN'), processPayroll);

module.exports = router;
