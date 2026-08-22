const router = require('express').Router();
const { register, verifyEmail, login, getMe } = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth');

router.post('/register', register);
router.get('/verify/:token', verifyEmail);
router.post('/login', login);
router.get('/me', protect, getMe);

module.exports = router;
