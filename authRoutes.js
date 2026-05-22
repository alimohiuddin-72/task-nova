// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const { register, login, getMe, updateMood } = require('../controllers/AuthController');
const { protect } = require('../middleware/auth');

router.post('/register', register);
router.post('/login',    login);
router.get('/me',        protect, getMe);
router.patch('/mood',    protect, updateMood);

module.exports = router;
