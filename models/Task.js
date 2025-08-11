const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true // faster lookups for user tasks
  },
  title: { // <--- ADD THIS, as your controller expects "title"
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    required: false, // make description optional (title is required)
    trim: true,
    default: ''
  },
  dueDate: {
    type: Date,
    default: null,
    index: true // useful for sorting/filtering
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'normal'],
    default: 'medium',
    index: true
  },
  category: {
    type: String,
    default: 'general',
    trim: true,
    index: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'archived'],
    default: 'pending',
    index: true
  },
  isDeleted: {
    type: Boolean,
    default: false, // soft delete support
    index: true
  },
  recurrence: {
    type: String,
    enum: ['none', 'daily', 'weekly', 'monthly'],
    default: 'none'
  },
  aiMetadata: {
    parsedDescription: { type: String },
    suggestedPriority: { type: String },
    suggestedCategory: { type: String },
    urgencyScore: { type: Number, min: 0, max: 1 },
    keywords: [{ type: String }],
    confidence: { type: Number, min: 0, max: 1 }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// ---- Virtual: isOverdue ----
taskSchema.virtual('isOverdue').get(function () {
  return !!(this.dueDate && this.status === 'pending' && new Date() > this.dueDate);
});

// ---- Pre-save hook: category lowercase ----
taskSchema.pre('save', function (next) {
  if (this.category) {
    this.category = this.category.toLowerCase();
  }
  next();
});

// ---- Clean JSON output ----
taskSchema.methods.toJSON = function () {
  const obj = this.toObject({ virtuals: true });
  delete obj.__v;
  return obj;
};

// ---- Add useful indexes (optional, for perf) ----
taskSchema.index({ userId: 1, status: 1 });
taskSchema.index({ userId: 1, dueDate: 1 });
taskSchema.index({ userId: 1, category: 1 });

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;
