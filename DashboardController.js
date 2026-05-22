// controllers/DashboardController.js  ── CONTROLLER LAYER ──
const Task = require('../models/Task');
const Progress = require('../models/Progress');
const User = require('../models/User');

// ── GET /api/dashboard/stats ──
const getStats = async (req, res) => {
  try {
    const userId = req.user._id;

    const [total, completed, pending, inProgress] = await Promise.all([
      Task.countDocuments({ userId }),
      Task.countDocuments({ userId, status: 'completed' }),
      Task.countDocuments({ userId, status: 'pending' }),
      Task.countDocuments({ userId, status: 'in-progress' }),
    ]);

    const critical = await Task.countDocuments({ userId, priority: 'critical', status: { $ne: 'completed' } });
    const overdue  = await Task.countDocuments({ userId, deadline: { $lt: new Date() }, status: { $ne: 'completed' } });

    const progress = await Progress.getOrCreate(userId);
    const user = await User.findById(userId);

    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    res.json({
      success: true,
      stats: {
        total,
        completed,
        pending,
        inProgress,
        critical,
        overdue,
        completionRate,
        streak: user.streak,
        points: user.points,
        level: user.level,
        weeklyLogs: progress.weeklyLogs,
        totalFocusMinutes: progress.totalFocusMinutes,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── GET /api/dashboard/upcoming ──
const getUpcoming = async (req, res) => {
  try {
    const tasks = await Task.find({
      userId: req.user._id,
      status: { $ne: 'completed' },
      deadline: { $gte: new Date() },
    })
      .sort('deadline')
      .limit(5);

    res.json({ success: true, tasks });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getStats, getUpcoming };
