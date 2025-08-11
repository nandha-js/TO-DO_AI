const Task = require('../models/Task');
const asyncHandler = require('express-async-handler');
const { parseTask } = require('../services/aiService');
const { extractKeywords } = require('../services/openaiService');

// @desc Create a new task with AI parsing and keyword extraction
// @route POST /api/tasks
// @access Private
exports.createTask = asyncHandler(async (req, res) => {
  const rawInput = req.body.description || req.body.title || '';

  if (!rawInput.trim()) {
    res.status(400);
    throw new Error('Task title or description is required');
  }

  // Call AI to parse task details
  const aiParsed = await parseTask(rawInput);

  // Extract keywords using AI
  const keywords = await extractKeywords(rawInput);

  const taskData = {
    userId: req.user._id,
    title: aiParsed.description || req.body.title || rawInput,
    description: req.body.description || '',
    category: aiParsed.category || req.body.category || 'general',
    priority: aiParsed.priority || req.body.priority || 'medium',
    dueDate: aiParsed.dueDate || req.body.dueDate || null,
    status: req.body.status || 'pending',
    recurrence: req.body.recurrence || 'none',
    aiMetadata: {
      keywords: keywords || [],
      suggestedPriority: aiParsed.priority || 'medium',
      suggestedCategory: aiParsed.category || 'general',
      urgencyScore: aiParsed.urgencyScore || null,
      confidence: aiParsed.confidence || null,
      parsedDescription: aiParsed.description || null,
    },
  };

  const task = await Task.create(taskData);

  res.status(201).json({ success: true, data: task });
});

// @desc Get all tasks for logged in user
// @route GET /api/tasks
// @access Private
exports.getTasks = asyncHandler(async (req, res) => {
  const tasks = await Task.find({ userId: req.user._id }).sort({ createdAt: -1 });
  res.json({ success: true, count: tasks.length, data: tasks });
});

// @desc Get single task by ID
// @route GET /api/tasks/:id
// @access Private
exports.getTaskById = asyncHandler(async (req, res) => {
  const task = await Task.findOne({ _id: req.params.id, userId: req.user._id });
  if (!task) {
    res.status(404);
    throw new Error('Task not found');
  }
  res.json({ success: true, data: task });
});

// @desc Update task details
// @route PUT /api/tasks/:id
// @access Private
exports.updateTask = asyncHandler(async (req, res) => {
  let task = await Task.findOne({ _id: req.params.id, userId: req.user._id });
  if (!task) {
    res.status(404);
    throw new Error('Task not found');
  }

  const allowedUpdates = ['title', 'description', 'category', 'priority', 'dueDate', 'status', 'recurrence'];
  allowedUpdates.forEach(field => {
    if (req.body[field] !== undefined) {
      task[field] = req.body[field];
    }
  });

  await task.save();

  res.json({ success: true, data: task });
});

// @desc Update only task status
// @route PATCH /api/tasks/:id/status
// @access Private
exports.updateTaskStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!status) {
    res.status(400);
    throw new Error('Status is required');
  }

  const validStatuses = ['pending', 'in-progress', 'completed', 'cancelled'];
  if (!validStatuses.includes(status)) {
    res.status(400);
    throw new Error(`Invalid status. Valid options: ${validStatuses.join(', ')}`);
  }

  const task = await Task.findOne({ _id: req.params.id, userId: req.user._id });
  if (!task) {
    res.status(404);
    throw new Error('Task not found');
  }

  task.status = status;
  await task.save();

  res.json({ success: true, message: 'Task status updated', data: task });
});

// @desc Delete single task
// @route DELETE /api/tasks/:id
// @access Private
exports.deleteTask = asyncHandler(async (req, res) => {
  const task = await Task.findOne({ _id: req.params.id, userId: req.user._id });
  if (!task) {
    res.status(404);
    throw new Error('Task not found');
  }

  await task.deleteOne();

  res.json({ success: true, message: 'Task deleted' });
});

// @desc Delete all completed tasks for user
// @route DELETE /api/tasks/completed
// @access Private
exports.deleteCompletedTasks = asyncHandler(async (req, res) => {
  const result = await Task.deleteMany({ userId: req.user._id, status: 'completed' });
  res.json({ success: true, message: `${result.deletedCount} completed tasks deleted` });
});
