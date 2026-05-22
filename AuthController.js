// controllers/AuthController.js  ── CONTROLLER LAYER ──
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Progress = require('../models/Progress');

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET || 'tasknova_secret_key', { expiresIn: '7d' });

// ── POST /api/auth/register ──
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ success: false, message: 'All fields are required' });

    const existing = await User.findOne({ email });
    if (existing)
      return res.status(409).json({ success: false, message: 'Email already registered' });

    const user = await User.create({ name, email, password });
    await Progress.create({ userId: user._id }); // bootstrap progress record

    const token = generateToken(user._id);
    res.status(201).json({
      success: true,
      token,
      user: { id: user._id, name: user.name, email: user.email, points: user.points, level: user.level, streak: user.streak },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── POST /api/auth/login ──
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ success: false, message: 'Email and password required' });

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password)))
      return res.status(401).json({ success: false, message: 'Invalid credentials' });

    // Update streak
    const today = new Date().toDateString();
    const lastActive = new Date(user.lastActiveDate).toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();

    if (lastActive === yesterday) user.streak += 1;
    else if (lastActive !== today) user.streak = 1;

    user.lastActiveDate = new Date();
    await user.save({ validateBeforeSave: false });

    const token = generateToken(user._id);
    res.json({
      success: true,
      token,
      user: { id: user._id, name: user.name, email: user.email, points: user.points, level: user.level, streak: user.streak, mood: user.mood },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── GET /api/auth/me ──
const getMe = async (req, res) => {
  res.json({ success: true, user: req.user });
};

// ── PATCH /api/auth/mood ──
const updateMood = async (req, res) => {
  try {
    const { mood } = req.body;
    const user = await User.findByIdAndUpdate(req.user._id, { mood }, { new: true });
    res.json({ success: true, mood: user.mood });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { register, login, getMe, updateMood };
