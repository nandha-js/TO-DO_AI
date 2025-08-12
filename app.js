// app.js
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');

const authRoutes = require('./routes/authRoutes');
const taskRoutes = require('./routes/taskRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const errorMiddleware = require('./middleware/errorMiddleware');

const app = express();

// Security headers
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: process.env.NODE_ENV === 'production' ? undefined : false,
}));

// Request logging
app.use(morgan('dev'));

// CORS setup (Netlify + local dev)
const allowedOrigins = [
  'https://to-doai.netlify.app', // Netlify frontend
  'http://localhost:5173'        // Local Vite dev
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

// Parse JSON with increased limit
app.use(express.json({ limit: '1mb' }));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/analytics', analyticsRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    status: 'OK',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV,
    uptime: process.uptime(),
  });
});

// Root route to avoid 404
app.get('/', (req, res) => {
  res.send('API is running');
});

// Handle unknown routes
app.all('*', (req, res, next) => {
  const err = new Error(`Route not found: ${req.originalUrl}`);
  err.statusCode = 404;
  next(err);
});

// Error handler
app.use(errorMiddleware);

module.exports = app;
