const { validationResult } = require('express-validator');

const UserService = require('../service/user-service');
const TokenService = require('../service/token-service');
const ApiError = require('../exceptions/api-error');

class UserController {

  async registration(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return next(ApiError.BadRequest('Ошибка проверки данных', errors.array()));
      }
      const { email, password } = req.body;
      const tokens = await UserService.registration(email, password);
      return responseWithTokens(res, tokens);
    } catch (err) {
      next(err);
    }
  }

  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const tokens = await UserService.login(email, password);
      return responseWithTokens(res, tokens);
    } catch (err) {
      next(err);
    }
  }

  async logout(req, res, next) {
    try {
      const { refreshToken } = req.cookies;
      const tokenRemoved = await UserService.logout(refreshToken);
      res.clearCookie('refreshToken');
      res.json({ tokenRemoved });
    } catch (err) {
      next(err);
    }
  }

  async activate(req, res, next) {
    try {
      const activateLink = req.params.link;
      await UserService.activate(activateLink);
      return res.redirect(process.env.CLIENT_URL);
    } catch (err) {
      next(err);
    }
  }

  async getUsers(req, res, next) {
    try {
      const users = await UserService.getAllUsers();
      return res.json({ users });
    } catch (err) {
      next(err);
    }
  }

  async refresh(req, res, next) {
    try {
      const { refreshToken } = req.cookies;
      const tokens = await UserService.refresh(refreshToken);
      return responseWithTokens(res, tokens);
    } catch (err) {
      next(err);
    }
  }
}

function responseWithTokens(res, tokens) {
  res.cookie('refreshToken', tokens.refreshToken, {
    maxAge: TokenService.REFRESH_TOKEN_LIVES_MS,
    httpOnly: true,
    secure: (process.env.NODE_ENV || 'development') !== 'development',
  });
  return res.json(tokens);
}

module.exports = new UserController();
