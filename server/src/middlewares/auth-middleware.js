const ApiError = require('../exceptions/api-error');
const TokenService = require('../service/token-service');

module.exports = function(req, res, next) {
  try {
    // console.log('headers >>>', req.headers);
    const authorizationHeader = req.headers['authorization'];
    if (!authorizationHeader) {
      return next(ApiError.UnautorizedError());
    }

    const accessToken = authorizationHeader.replace(/Bearer /i, '');
    // console.log('access token >>>', accessToken);

    const userData = TokenService.validateAccessToken(accessToken);
    if (!userData) {
      return next(ApiError.UnautorizedError());
    }

    req.user = userData;
    next();
  } catch (err) {
    return next(ApiError.UnautorizedError());
  }
};
