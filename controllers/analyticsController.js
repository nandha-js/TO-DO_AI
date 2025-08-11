// controllers/analyticsController.js
const analyticsService = require('../services/analyticsService');

// ✅ Utility to safely get user ID from JWT middleware
const getUserIdFromReq = (req) => req.user?.userId || req.user?._id || null;

/**
 * 📊 Get task completion statistics with granularity (day/week/month)
 */
exports.getTaskCompletionStats = async (req, res) => {
  try {
    const userId = getUserIdFromReq(req);
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const weeks = parseInt(req.query.weeks, 10) || 8;
    const granularity = ['day', 'week', 'month'].includes(req.query.granularity)
      ? req.query.granularity
      : 'week';

    let stats;
    if (granularity === 'day') {
      stats = await analyticsService.getDailyCompletedTasks(userId, weeks * 7);
    } else if (granularity === 'week') {
      stats = await analyticsService.getWeeklyCompletedTasks(userId, weeks);
    } else if (granularity === 'month') {
      stats = await analyticsService.getMonthlyCompletedTasks(userId, weeks);
    } else {
      stats = await analyticsService.getWeeklyCompletedTasks(userId, weeks);
    }

    const totalCompleted = stats.reduce((sum, s) => sum + (s.count || 0), 0);

    res.json({
      success: true,
      period: { type: granularity, length: weeks },
      insights: {
        totalCompleted,
        averagePerPeriod: stats.length ? parseFloat((totalCompleted / stats.length).toFixed(2)) : 0,
        bestPeriod: stats.length
          ? stats.reduce((max, s) => (s.count > max.count ? s : max), stats[0])
          : null,
      },
      data: stats,
    });
  } catch (error) {
    console.error('Error fetching task completion stats:', error);
    res.status(500).json({ success: false, message: 'Server error fetching task completion analytics' });
  }
};

/**
 * 📂 Get task category breakdown within a date range
 */
exports.getCategoryBreakdown = async (req, res) => {
  try {
    const userId = getUserIdFromReq(req);
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    let { dateFrom, dateTo } = req.query;
    const now = new Date();

    if (!dateFrom || !dateTo) {
      dateTo = now.toISOString();
      const past = new Date();
      past.setDate(now.getDate() - 30);
      dateFrom = past.toISOString();
    }

    const breakdown = await analyticsService.getCategoryStats(userId, dateFrom, dateTo);

    res.json({
      success: true,
      dateRange: { from: dateFrom, to: dateTo },
      insights: {
        topCategory: breakdown.length ? breakdown[0] : null,
        totalCategories: breakdown.length,
      },
      data: breakdown,
    });
  } catch (error) {
    console.error('Error fetching category breakdown:', error);
    res.status(500).json({ success: false, message: 'Server error fetching category breakdown' });
  }
};

/**
 * 🔥 Get user's productivity streaks
 */
exports.getProductivityStreaks = async (req, res) => {
  try {
    const userId = getUserIdFromReq(req);
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const streakData = await analyticsService.getStreakData(userId);

    res.json({
      success: true,
      currentStreak: streakData?.currentStreak || 0,
      longestStreak: streakData?.longestStreak || 0,
      missedDays: streakData?.missedDays || [],
    });
  } catch (error) {
    console.error('Error fetching streak data:', error);
    res.status(500).json({ success: false, message: 'Server error fetching productivity streaks' });
  }
};

/**
 * 📈 Get productivity monthly trends
 */
exports.getProductivityTrends = async (req, res) => {
  try {
    const userId = getUserIdFromReq(req);
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const months = parseInt(req.query.months, 10) || 6;
    const trends = await analyticsService.getMonthlyTrends(userId, months);

    res.json({
      success: true,
      monthsAnalyzed: months,
      insights: {
        trendDirection:
          trends.length > 1
            ? trends[trends.length - 1].count > trends[0].count
              ? 'upward'
              : 'downward'
            : 'stable',
        bestMonth:
          trends.length > 0
            ? trends.reduce((max, s) => (s.count > max.count ? s : max), trends[0])
            : null,
      },
      data: trends,
    });
  } catch (error) {
    console.error('Error fetching productivity trends:', error);
    res.status(500).json({ success: false, message: 'Server error fetching productivity trends' });
  }
};
