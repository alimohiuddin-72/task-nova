// controllers/FocusController.js  ── CONTROLLER LAYER ──
const Task = require('../models/Task');
const Progress = require('../models/Progress');
const User = require('../models/User');

// ── POST /api/focus/session/start ──
const startSession = async (req, res) => {
  try {
    const { taskId, duration = 25 } = req.body;

    if (taskId) {
      const task = await Task.findOne({ _id: taskId, userId: req.user._id });
      if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
      task.status = 'in-progress';
      await task.save();
    }

    res.json({
      success: true,
      session: {
        startedAt: new Date(),
        durationMinutes: duration,
        taskId: taskId || null,
      },
      message: `Focus session started for ${duration} minutes 🎯`,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── POST /api/focus/session/end ──
const endSession = async (req, res) => {
  try {
    const { taskId, durationMinutes = 25, completed = false } = req.body;

    // Update progress
    const progress = await Progress.getOrCreate(req.user._id);
    progress.recordActivity(0, durationMinutes, 0);
    await progress.save();

    // Award bonus points for focus
    const bonusPoints = Math.floor(durationMinutes / 5) * 2;
    await User.findByIdAndUpdate(req.user._id, { $inc: { points: bonusPoints } });

    if (taskId) {
      await Task.findOneAndUpdate(
        { _id: taskId, userId: req.user._id },
        { $inc: { focusSessionsCount: 1 } }
      );
    }

    res.json({
      success: true,
      message: `Great work! You focused for ${durationMinutes} minutes 🔥`,
      bonusPoints,
      totalFocusMinutes: progress.totalFocusMinutes,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { startSession, endSession };
