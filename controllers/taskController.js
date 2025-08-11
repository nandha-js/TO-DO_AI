// controllers/taskController.js
const Task = require('../models/Task');
const asyncHandler = require('express-async-handler');

// @desc Create a new task
// @route POST /api/tasks
// @access Private
exports.createTask = asyncHandler(async (req, res) => {
  const { title, description, category, priority, dueDate } = req.body;

  if (!title) {
    res.status(400);
    throw new Error('Task title is required');
  }

  const task = await Task.create({
    userId: req.user._id,
    title,
    description: description || '',
    category: category || 'General',
    priority: priority || 'normal',
    dueDate: dueDate || null,
    status: 'pending',
  });

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

  task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
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

  // Use deleteOne on the document instead of remove()
  await task.deleteOne();

  res.json({ success: true, message: 'Task deleted' });
});


// @desc Delete all completed tasks for user
// @route DELETE /api/tasks
// @access Private
exports.deleteCompletedTasks = asyncHandler(async (req, res) => {
  const result = await Task.deleteMany({ userId: req.user._id, status: 'completed' });
  res.json({ success: true, message: `${result.deletedCount} completed tasks deleted` });
});
