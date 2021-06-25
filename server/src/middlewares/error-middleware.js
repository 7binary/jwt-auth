const ApiError = require('../exceptions/api-error');

module.exports = function(err, req, res, next) {
  console.error(err);
  const env = process.env.NODE_ENV || 'development';

  if (err instanceof ApiError) {
    return res.status(err.status).json({
      message: err.message,
      errors: err.errors,
    });
  }

  const responseData = { message: 'Непредвиденная ошибка' };
  if (env === 'development') {
    responseData.error = err.toString();
  }

  return res.status(500).json(responseData);
};
