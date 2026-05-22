// models/Progress.js  ── MODEL LAYER ──
const mongoose = require('mongoose');

const dailyLogSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  completedTasks: { type: Number, default: 0 },
  focusMinutes: { type: Number, default: 0 },
  pointsEarned: { type: Number, default: 0 },
});

const progressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    totalTasksCompleted: { type: Number, default: 0 },
    totalFocusMinutes: { type: Number, default: 0 },
    currentStreak: { type: Number, default: 0 },
    longestStreak: { type: Number, default: 0 },
    weeklyLogs: [dailyLogSchema],      // last 7 days
    monthlyLogs: [dailyLogSchema],     // last 30 days
    lastUpdated: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// ── Static: get or create progress record ──
progressSchema.statics.getOrCreate = async function (userId) {
  let progress = await this.findOne({ userId });
  if (!progress) {
    progress = await this.create({ userId });
  }
  return progress;
};

// ── Instance method: record today's activity ──
progressSchema.methods.recordActivity = function (completedTasks = 0, focusMinutes = 0, points = 0) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let todayLog = this.weeklyLogs.find(
    (log) => new Date(log.date).toDateString() === today.toDateString()
  );

  if (!todayLog) {
    this.weeklyLogs.push({ date: today, completedTasks, focusMinutes, pointsEarned: points });
    if (this.weeklyLogs.length > 7) this.weeklyLogs.shift();
  } else {
    todayLog.completedTasks += completedTasks;
    todayLog.focusMinutes  += focusMinutes;
    todayLog.pointsEarned  += points;
  }

  this.totalTasksCompleted += completedTasks;
  this.totalFocusMinutes   += focusMinutes;
  this.lastUpdated = new Date();
};

module.exports = mongoose.model('Progress', progressSchema);
