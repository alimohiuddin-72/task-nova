// routes/focusRoutes.js
const express = require('express');
const router = express.Router();
const { startSession, endSession } = require('../controllers/FocusController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.post('/session/start', startSession);
router.post('/session/end',   endSession);

module.exports = router;
