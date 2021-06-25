const bcrypt = require('bcrypt');
const { nanoid } = require('nanoid');

const UserModel = require('../models/user-model');
const MailService = require('../service/mail-service');
const TokenService = require('../service/token-service');
const UserDto = require('../dto/user-dto');
const ApiError = require('../exceptions/api-error');

class UserService {

  async logout(refreshToken) {
    return await TokenService.removeToken(refreshToken);
  }

  async login(email, password) {
    const user = await UserModel.findOne({ email });
    if (user) {
      const isPassEquals = await bcrypt.compare(password, user.password);
      if (isPassEquals) {
        const userDto = new UserDto(user);
        const tokens = TokenService.generateToken({ ...userDto });
        await TokenService.saveToken(userDto.id, tokens.refreshToken);
        return { ...tokens, user: userDto };
      }
    }
    throw ApiError.BadRequest('Неверное имя пользователя или пароль');
  }

  async registration(email, password) {
    const candidate = await UserModel.findOne({ email });
    if (candidate) {
      throw ApiError.BadRequest(`Пользователь с почтовым адресом ${email} уже существует`);
    }

    const pwHash = await bcrypt.hash(password, 3);
    const activateLink = nanoid();
    const user = await UserModel.create({ email, password: pwHash, activateLink });

    const userDto = new UserDto(user);
    const tokens = TokenService.generateToken({ ...userDto });
    await TokenService.saveToken(userDto.id, tokens.refreshToken);

    await MailService.sendActivationMail(email, `${process.env.API_URL}/api/activate/${activateLink}`);

    return { ...tokens, user: userDto };
  }

  async activate(activateLink) {
    const user = await UserModel.findOne({ activateLink });
    if (!user) {
      throw ApiError.BadRequest('Пользователь не найден');
    }
    user.isActivated = true;
    await user.save();
  }

  async refresh(refreshToken) {
    if (!refreshToken) {
      throw ApiError.UnautorizedError();
    }
    const userData = TokenService.validateRefreshToken(refreshToken);
    const tokenFromDb = await TokenService.findToken(refreshToken);

    if (!userData || !tokenFromDb) {
      throw ApiError.UnautorizedError();
    }

    const user = await UserModel.findById(userData.id);
    const userDto = new UserDto(user);
    const tokens = TokenService.generateToken({ ...userDto });

    await TokenService.saveToken(userDto.id, tokens.refreshToken);
    return { ...tokens, user: userDto };
  }

  async getAllUsers() {
    const users = await UserModel.find();
    return users;
  }
}

module.exports = new UserService();
