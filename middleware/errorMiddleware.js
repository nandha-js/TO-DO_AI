const errorMiddleware = (err, req, res, next) => {
  const errorId = `ERR-${Date.now()}-${Math.floor(Math.random() * 1000)}`; // Unique error ID

  // Use controller-set statusCode or fallback to err.statusCode or 500
  const statusCode = res.statusCode && res.statusCode !== 200 
    ? res.statusCode 
    : err.statusCode || 500;

  // Log error details for debugging
  console.error(`\n[Error ID: ${errorId}] ${req.method} ${req.originalUrl}`);
  console.error('User:', req.user?._id || req.user?.userId || 'Guest');
  console.error('Status Code:', statusCode);
  console.error('Message:', err.message);
  console.error('Stack:', err.stack || err);

  // Customize error message for known error types
  let message = err.message || 'Internal Server Error';

  if (err.name === 'ValidationError') message = 'Validation failed';
  else if (err.name === 'CastError') message = 'Invalid ID format';
  else if (err.code === 11000) message = 'Duplicate field value entered';
  else if (err.name === 'JsonWebTokenError') message = 'Invalid authentication token';
  else if (err.name === 'TokenExpiredError') message = 'Authentication token expired';

  res.status(statusCode).json({
    success: false,
    errorId,
    errorCode: err.code || err.name || 'SERVER_ERROR',
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = errorMiddleware;
