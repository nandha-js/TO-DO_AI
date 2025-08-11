const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { protect } = require('../middleware/authMiddleware'); // ✅ destructure the middleware function

// Protect all analytics routes
router.use(protect);

/**
 * @route   GET /api/analytics/completion-stats
 * @desc    Get completed tasks stats (weekly, monthly, etc.)
 */
router.get('/completion-stats', analyticsController.getTaskCompletionStats);

/**
 * @route   GET /api/analytics/category-stats
 * @desc    Get completed tasks count per category
 */
router.get('/category-stats', analyticsController.getCategoryBreakdown);

/**
 * @route   GET /api/analytics/productivity-trends
 * @desc    Get productivity trends
 */
router.get('/productivity-trends', analyticsController.getProductivityTrends);

/**
 * @route   GET /api/analytics/streaks
 * @desc    Get productivity streak data
 */
router.get('/streaks', analyticsController.getProductivityStreaks);

module.exports = router;
