const ErrorResponse = require('../utils/errorResponse');

const errorHandler = (err, req, res, next) => {
  res.status(err.code || 500).json({
    success: false,
    error: err.message || 'Server Error',
  });
};

module.exports = errorHandler;
