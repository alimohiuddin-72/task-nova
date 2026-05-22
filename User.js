// models/User.js  ── MODEL LAYER ──
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    // ── Gamification ──
    points: { type: Number, default: 0 },
    level: { type: String, default: 'Beginner', enum: ['Beginner', 'Explorer', 'Achiever', 'Pro', 'Master'] },
    badges: [{ type: String }],
    // ── Streak Tracking ──
    streak: { type: Number, default: 0 },
    lastActiveDate: { type: Date, default: Date.now },
    // ── Preferences ──
    mood: { type: String, default: 'focus', enum: ['lazy', 'focus', 'exam'] },
    theme: { type: String, default: 'dark', enum: ['dark', 'light'] },
    avatar: { type: String, default: '' },
  },
  { timestamps: true }
);

// ── Pre-save: hash password ──
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ── Instance method: compare password ──
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// ── Instance method: calculate level from points ──
userSchema.methods.updateLevel = function () {
  if (this.points >= 1000) this.level = 'Master';
  else if (this.points >= 500) this.level = 'Pro';
  else if (this.points >= 200) this.level = 'Achiever';
  else if (this.points >= 50)  this.level = 'Explorer';
  else this.level = 'Beginner';
};

module.exports = mongoose.model('User', userSchema);
