// controllers/TaskController.js  ── CONTROLLER LAYER ──
const Task = require('../models/Task');
const User = require('../models/User');
const Progress = require('../models/Progress');

// ── Smart Priority Engine ──
const computeSmartPriority = (deadline, description = '') => {
  if (!deadline) return 'medium';
  const daysLeft = Math.ceil((new Date(deadline) - Date.now()) / (1000 * 60 * 60 * 24));
  const longText = description.length > 200;

  if (daysLeft <= 1) return 'critical';
  if (daysLeft <= 3) return 'high';
  if (daysLeft <= 7 && longText) return 'high';
  if (daysLeft <= 7) return 'medium';
  return 'low';
};

// ── Points per priority ──
const pointsMap = { critical: 50, high: 30, medium: 20, low: 10 };

// ── GET /api/tasks ──
const getTasks = async (req, res) => {
  try {
    const { status, priority, category, sort = 'deadline' } = req.query;
    const filter = { userId: req.user._id };

    if (status)   filter.status   = status;
    if (priority) filter.priority = priority;
    if (category) filter.category = category;

    const sortMap = { deadline: 'deadline', priority: '-priority', created: '-createdAt', order: 'order' };
    const tasks = await Task.find(filter).sort(sortMap[sort] || '-createdAt');

    res.json({ success: true, count: tasks.length, tasks });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── POST /api/tasks ──
const createTask = async (req, res) => {
  try {
    const { title, description, deadline, category, estimatedMinutes, tags } = req.body;

    // Smart priority auto-detection
    const priority = computeSmartPriority(deadline, description);

    const task = await Task.create({
      userId: req.user._id,
      title,
      description,
      deadline,
      priority,
      category,
      estimatedMinutes,
      tags,
    });

    res.status(201).json({ success: true, task, smartPriority: priority });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── GET /api/tasks/:id ──
const getTask = async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, userId: req.user._id });
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
    res.json({ success: true, task });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── PATCH /api/tasks/:id ──
const updateTask = async (req, res) => {
  try {
    const { deadline, description } = req.body;
    // Re-compute priority if deadline or description changed
    if (deadline || description) {
      const existing = await Task.findById(req.params.id);
      req.body.priority = computeSmartPriority(
        deadline || existing?.deadline,
        description || existing?.description
      );
    }

    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
    res.json({ success: true, task });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── PATCH /api/tasks/:id/complete ──
const completeTask = async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, userId: req.user._id });
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

    task.status = 'completed';
    task.completedAt = new Date();
    task.pointsEarned = pointsMap[task.priority] || 20;
    await task.save();

    // Award points & update level
    const user = await User.findById(req.user._id);
    user.points += task.pointsEarned;
    user.updateLevel();
    await user.save({ validateBeforeSave: false });

    // Update progress
    const progress = await Progress.getOrCreate(req.user._id);
    progress.recordActivity(1, 0, task.pointsEarned);
    await progress.save();

    // Badge logic
    const badges = [];
    if (user.points >= 50  && !user.badges.includes('First Steps'))     { user.badges.push('First Steps');     badges.push('First Steps'); }
    if (user.points >= 200 && !user.badges.includes('On a Roll'))       { user.badges.push('On a Roll');       badges.push('On a Roll'); }
    if (user.points >= 500 && !user.badges.includes('Productivity Pro')) { user.badges.push('Productivity Pro'); badges.push('Productivity Pro'); }
    if (badges.length) await user.save({ validateBeforeSave: false });

    res.json({ success: true, task, pointsEarned: task.pointsEarned, newBadges: badges, totalPoints: user.points, level: user.level });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── DELETE /api/tasks/:id ──
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
    res.json({ success: true, message: 'Task deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── POST /api/tasks/:id/notes ──
const addNote = async (req, res) => {
  try {
    const { content, links } = req.body;
    const task = await Task.findOne({ _id: req.params.id, userId: req.user._id });
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

    task.notes.push({ content, links });
    await task.save();
    res.json({ success: true, notes: task.notes });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── PATCH /api/tasks/reorder ──
const reorderTasks = async (req, res) => {
  try {
    const { orderedIds } = req.body; // array of task IDs in new order
    const updates = orderedIds.map((id, index) =>
      Task.updateOne({ _id: id, userId: req.user._id }, { order: index })
    );
    await Promise.all(updates);
    res.json({ success: true, message: 'Order updated' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── GET /api/tasks/suggestions ──
const getStudySuggestions = async (req, res) => {
  try {
    const tasks = await Task.find({ userId: req.user._id, status: { $ne: 'completed' } }).sort('deadline');
    const suggestions = [];

    tasks.forEach((t) => {
      if (!t.deadline) return;
      const days = Math.ceil((new Date(t.deadline) - Date.now()) / 86400000);
      if (days <= 1)  suggestions.push({ task: t, message: `⚠️ "${t.title}" is due tomorrow! Start now.` });
      else if (days <= 3) suggestions.push({ task: t, message: `📌 "${t.title}" is due in ${days} days. Plan your time.` });
      else if (days <= 7 && t.priority === 'high') suggestions.push({ task: t, message: `🎯 "${t.title}" needs attention this week.` });
    });

    res.json({ success: true, suggestions: suggestions.slice(0, 5) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getTasks, createTask, getTask, updateTask, completeTask, deleteTask, addNote, reorderTasks, getStudySuggestions };
