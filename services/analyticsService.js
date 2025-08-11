// services/analyticsService.js
const Task = require('../models/Task');
const mongoose = require('mongoose');

// Convert string userId to ObjectId safely
function toObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id) ? new mongoose.Types.ObjectId(id) : null;
}

/**
 * Get ISO Week number for a date
 */
function isoWeek(date) {
  const target = new Date(date.valueOf());
  const dayNr = (date.getDay() + 6) % 7;
  target.setDate(target.getDate() - dayNr + 3);
  const firstThursday = target.valueOf();
  target.setMonth(0, 1);
  if (target.getDay() !== 4) {
    target.setMonth(0, 1 + ((4 - target.getDay()) + 7) % 7);
  }
  return 1 + Math.ceil((firstThursday - target) / 604800000);
}

/**
 * Get ISO Week Year for a date
 */
function isoWeekYear(date) {
  const d = new Date(date.valueOf());
  d.setDate(d.getDate() - ((date.getDay() + 6) % 7) + 3);
  return d.getFullYear();
}

/**
 * Weekly completed task stats
 */
async function getWeeklyCompletedTasks(userId, weeksCount = 8) {
  const objectId = toObjectId(userId);
  if (!objectId) throw new Error('Invalid userId');

  const now = new Date();
  const startDate = new Date(now);
  startDate.setDate(startDate.getDate() - weeksCount * 7);

  const pipeline = [
    {
      $match: {
        userId: objectId,
        status: 'completed',
        updatedAt: { $gte: startDate },
      },
    },
    {
      $group: {
        _id: {
          year: { $isoWeekYear: '$updatedAt' },
          week: { $isoWeek: '$updatedAt' },
        },
        count: { $sum: 1 },
      },
    },
    { $sort: { '_id.year': 1, '_id.week': 1 } },
  ];

  const results = await Task.aggregate(pipeline);

  const countsMap = {};
  results.forEach(r => {
    countsMap[`${r._id.year}-${r._id.week}`] = r.count;
  });

  const data = [];
  for (let i = weeksCount - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i * 7);
    const year = isoWeekYear(d);
    const week = isoWeek(d);
    const label = `W${week} ${year}`;
    data.push({ label, count: countsMap[`${year}-${week}`] || 0 });
  }

  return data;
}

/**
 * Monthly completed task stats
 */
async function getMonthlyCompletedTasks(userId, monthsCount = 6) {
  const objectId = toObjectId(userId);
  if (!objectId) throw new Error('Invalid userId');

  const now = new Date();
  const startDate = new Date(now.getFullYear(), now.getMonth() - monthsCount + 1, 1);

  const pipeline = [
    {
      $match: {
        userId: objectId,
        status: 'completed',
        updatedAt: { $gte: startDate },
      },
    },
    {
      $group: {
        _id: {
          year: { $year: '$updatedAt' },
          month: { $month: '$updatedAt' },
        },
        count: { $sum: 1 },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
  ];

  const results = await Task.aggregate(pipeline);

  const countsMap = {};
  results.forEach(r => {
    countsMap[`${r._id.year}-${r._id.month}`] = r.count;
  });

  const data = [];
  for (let i = monthsCount - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const label = `${d.toLocaleString('default', { month: 'short' })} ${d.getFullYear()}`;
    data.push({ label, count: countsMap[`${d.getFullYear()}-${d.getMonth() + 1}`] || 0 });
  }

  return data;
}

/**
 * Daily completed task stats
 */
async function getDailyCompletedTasks(userId, daysCount = 7) {
  const objectId = toObjectId(userId);
  if (!objectId) throw new Error('Invalid userId');

  const now = new Date();
  const startDate = new Date(now);
  startDate.setDate(startDate.getDate() - daysCount + 1);

  const pipeline = [
    {
      $match: {
        userId: objectId,
        status: 'completed',
        updatedAt: { $gte: startDate },
      },
    },
    {
      $group: {
        _id: {
          year: { $year: '$updatedAt' },
          month: { $month: '$updatedAt' },
          day: { $dayOfMonth: '$updatedAt' },
        },
        count: { $sum: 1 },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
  ];

  const results = await Task.aggregate(pipeline);

  const countsMap = {};
  results.forEach(r => {
    countsMap[`${r._id.year}-${r._id.month}-${r._id.day}`] = r.count;
  });

  const data = [];
  for (let i = daysCount - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const label = d.toISOString().split('T')[0];
    data.push({ label, count: countsMap[`${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`] || 0 });
  }

  return data;
}

/**
 * Get productivity streak data
 */
async function getStreakData(userId) {
  const objectId = toObjectId(userId);
  if (!objectId) throw new Error('Invalid userId');

  const tasksByDay = await Task.aggregate([
    { $match: { userId: objectId, status: 'completed' } },
    {
      $group: {
        _id: {
          year: { $year: '$updatedAt' },
          month: { $month: '$updatedAt' },
          day: { $dayOfMonth: '$updatedAt' },
        },
        count: { $sum: 1 },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
  ]);

  const completedDates = new Set(tasksByDay.map(d => {
    const y = d._id.year, m = d._id.month, day = d._id.day;
    return new Date(y, m - 1, day).toISOString().slice(0, 10);
  }));

  const today = new Date();
  today.setHours(0,0,0,0);

  let currentStreak = 0;
  let longestStreak = 0;
  let missedDays = [];

  let day = new Date(today);
  let streakRunning = true;

  for (let i = 0; i < 365; i++) {
    const isoDay = day.toISOString().slice(0, 10);
    if (completedDates.has(isoDay)) {
      if (streakRunning) currentStreak++;
      if (currentStreak > longestStreak) longestStreak = currentStreak;
    } else {
      if (streakRunning) streakRunning = false;
      missedDays.push(isoDay);
      currentStreak = 0;
    }
    day.setDate(day.getDate() - 1);
  }

  return {
    currentStreak,
    longestStreak,
    missedDays,
  };
}

/**
 * Get productivity monthly trends
 */
async function getMonthlyTrends(userId, monthsCount = 6) {
  const objectId = toObjectId(userId);
  if (!objectId) throw new Error('Invalid userId');

  const now = new Date();
  const startDate = new Date(now.getFullYear(), now.getMonth() - monthsCount + 1, 1);

  const pipeline = [
    {
      $match: {
        userId: objectId,
        status: 'completed',
        updatedAt: { $gte: startDate },
      },
    },
    {
      $group: {
        _id: {
          year: { $year: '$updatedAt' },
          month: { $month: '$updatedAt' },
        },
        count: { $sum: 1 },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
  ];

  const results = await Task.aggregate(pipeline);

  const countsMap = {};
  results.forEach(r => {
    countsMap[`${r._id.year}-${r._id.month}`] = r.count;
  });

  const data = [];
  for (let i = monthsCount - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const label = `${d.toLocaleString('default', { month: 'short' })} ${d.getFullYear()}`;
    data.push({ label, count: countsMap[`${d.getFullYear()}-${d.getMonth() + 1}`] || 0 });
  }

  return data;
}

/**
 * Get category breakdown data
 */
async function getCategoryStats(userId, dateFrom, dateTo) {
  const objectId = toObjectId(userId);
  if (!objectId) throw new Error('Invalid userId');

  const fromDate = new Date(dateFrom);
  const toDate = new Date(dateTo);

  const pipeline = [
    {
      $match: {
        userId: objectId,
        status: 'completed',
        updatedAt: { $gte: fromDate, $lte: toDate },
      },
    },
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 },
      },
    },
    { $sort: { count: -1 } },
  ];

  const results = await Task.aggregate(pipeline);

  return results.map(r => ({
    category: r._id || 'Uncategorized',
    count: r.count,
  }));
}

module.exports = {
  getWeeklyCompletedTasks,
  getMonthlyCompletedTasks,
  getDailyCompletedTasks,
  getStreakData,
  getMonthlyTrends,
  getCategoryStats,
};
