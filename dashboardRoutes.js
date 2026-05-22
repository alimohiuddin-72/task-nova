// routes/dashboardRoutes.js
const express = require('express');
const router = express.Router();
const { getStats, getUpcoming } = require('../controllers/DashboardController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/stats',    getStats);
router.get('/upcoming', getUpcoming);

module.exports = router;
