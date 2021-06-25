const jwt = require('jsonwebtoken');
const TokenModel = require('../models/token-model');

class TokenService {
  REFRESH_TOKEN_LIVES_MS = 1000 * 60 * 60 * 24 * 30; // 30 days, to set cookie
  JWT_REFRESH_EXPIRES_IN = '30s';
  JWT_ACCESS_EXPIRES_IN = '15s';

  generateToken(payload) {
    const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_SECRET, { expiresIn: this.JWT_ACCESS_EXPIRES_IN });
    const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn: this.JWT_REFRESH_EXPIRES_IN });

    return { accessToken, refreshToken };
  }

  async saveToken(userId, refreshToken) {
    const model = await TokenModel.findOne({ user: userId });

    if (model) {
      model.refreshToken = refreshToken;
      await model.save();
    } else {
      await TokenModel.create({ user: userId, refreshToken });
    }

    return refreshToken;
  }

  validateAccessToken(token) {
    try {
      const userData = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
      return userData;
    } catch (e) {
      return null;
    }
  }

  validateRefreshToken(token) {
    try {
      const userData = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
      return userData;
    } catch (e) {
      return null;
    }
  }

  async findToken(refreshToken) {
    const tokenData = await TokenModel.findOne({ refreshToken });
    return tokenData;
  }

  async removeToken(refreshToken) {
    const result = await TokenModel.deleteOne({ refreshToken });
    // {
    //   "n": 1,
    //   "ok": 1,
    //   "deletedCount": 1
    // }
    return result.deletedCount > 0;
  }
}

module.exports = new TokenService();
