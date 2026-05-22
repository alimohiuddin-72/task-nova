// models/Task.js  ── MODEL LAYER ──
const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  content: { type: String, required: true },
  links:   [{ type: String }],
  createdAt: { type: Date, default: Date.now },
});

const taskSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    description: { type: String, trim: true, maxlength: [500, 'Description cannot exceed 500 characters'] },
    deadline: { type: Date },
    // ── Smart Priority (auto-set by controller) ──
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium',
    },
    status: {
      type: String,
      enum: ['pending', 'in-progress', 'completed'],
      default: 'pending',
    },
    category: {
      type: String,
      enum: ['assignment', 'exam', 'project', 'reading', 'other'],
      default: 'other',
    },
    // ── Focus tracking ──
    estimatedMinutes: { type: Number, default: 25 },
    focusSessionsCount: { type: Number, default: 0 },
    // ── Notes inside task ──
    notes: [noteSchema],
    // ── Gamification ──
    pointsEarned: { type: Number, default: 0 },
    completedAt: { type: Date },
    order: { type: Number, default: 0 }, // for drag & drop
    tags: [{ type: String }],
  },
  { timestamps: true }
);

// ── Virtual: days until deadline ──
taskSchema.virtual('daysLeft').get(function () {
  if (!this.deadline) return null;
  const diff = this.deadline - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
});

taskSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Task', taskSchema);
