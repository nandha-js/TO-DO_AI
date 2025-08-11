const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');

// Protect all task routes
router.use(protect);

/**
 * @route   POST /api/tasks
 * @desc    Create a new task
 * @access  Private
 */
router.post('/', taskController.createTask);

/**
 * @route   GET /api/tasks
 * @desc    Get all tasks for logged-in user
 * @access  Private
 */
router.get('/', taskController.getTasks);

/**
 * @route   GET /api/tasks/:id
 * @desc    Get single task by ID
 * @access  Private
 */
router.get('/:id', taskController.getTaskById);

/**
 * @route   PUT /api/tasks/:id
 * @desc    Update task details
 * @access  Private
 */
router.put('/:id', taskController.updateTask);

/**
 * @route   PATCH /api/tasks/:id/status
 * @desc    Update only the status of a task
 * @access  Private
 */
router.patch('/:id/status', taskController.updateTaskStatus);

/**
 * @route   DELETE /api/tasks/completed
 * @desc    Delete all completed tasks
 * @access  Private
 */
router.delete('/completed', taskController.deleteCompletedTasks);

/**
 * @route   DELETE /api/tasks/:id
 * @desc    Delete a single task
 * @access  Private
 */
router.delete('/:id', taskController.deleteTask);

module.exports = router;
