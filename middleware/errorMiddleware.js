// middleware/errorMiddleware.js
const errorMiddleware = (err, req, res, next) => {
  const errorId = `ERR-${Date.now()}-${Math.floor(Math.random() * 1000)}`; // Unique error tracking ID

  // Pick best status code (controller-set > error object > 500)
  const statusCode = res.statusCode && res.statusCode !== 200 
    ? res.statusCode 
    : err.statusCode || 500;

  // Log error with context
  console.error(`\n[Error ID: ${errorId}] ${req.method} ${req.originalUrl}`);
  console.error('User:', req.user?._id || req.user?.userId || 'Guest');
  console.error('Status Code:', statusCode);
  console.error('Message:', err.message);
  console.error('Stack:', err.stack || err);

  // Default message
  let message = err.message || 'Internal Server Error';

  // Common special cases
  if (err.name === 'ValidationError') message = 'Validation failed';
  if (err.name === 'CastError') message = 'Invalid ID format';
  if (err.code === 11000) message = 'Duplicate field value entered';
  if (err.name === 'JsonWebTokenError') message = 'Invalid authentication token';
  if (err.name === 'TokenExpiredError') message = 'Authentication token expired';

  res.status(statusCode).json({
    success: false,
    errorId,
    errorCode: err.code || err.name || 'SERVER_ERROR',
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = errorMiddleware;
