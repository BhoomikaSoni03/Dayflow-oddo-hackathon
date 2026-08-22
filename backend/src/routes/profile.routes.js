const router = require('express').Router();
const { protect, requireVerified } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');
const {
  getMyProfile,
  updateMyProfile,
  getAllProfiles,
  getProfileById,
  updateProfileById,
} = require('../controllers/profile.controller');

router.use(protect, requireVerified);

router.get('/me', getMyProfile);
router.patch('/me', updateMyProfile);
router.get('/all', requireRole('ADMIN'), getAllProfiles);
router.get('/:userId', requireRole('ADMIN'), getProfileById);
router.patch('/:userId', requireRole('ADMIN'), updateProfileById);

module.exports = router;
