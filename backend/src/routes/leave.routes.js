const router = require('express').Router();
const { protect, requireVerified } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');
const { applyLeave, getMyLeaves, getAllLeaves, reviewLeave } = require('../controllers/leave.controller');

router.use(protect, requireVerified);

router.post('/apply', applyLeave);
router.get('/me', getMyLeaves);
router.get('/all', requireRole('ADMIN'), getAllLeaves);
router.patch('/:id/review', requireRole('ADMIN'), reviewLeave);

module.exports = router;
