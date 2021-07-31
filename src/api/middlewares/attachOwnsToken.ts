import { Container } from 'typedi';
import mongoose from 'mongoose';
import { Logger } from 'winston';
import { IRefreshToken } from '../../interfaces/IRefreshToken';

/**
 * Attach user to req.currentUser.ownsToken
 * @param {*} req Express req Object
 * @param {*} res  Express res Object
 * @param {*} next  Express next Function
 */
const attachOwnsToken = async (req, res, next) => {
  const Logger: Logger = Container.get('logger');
  try {
    const RefreshTokenModel = Container.get('refreshTokenModel') as mongoose.Model<IRefreshToken & mongoose.Document>;
    const refreshTokens = await RefreshTokenModel.find({ user: req.currentUser._id });
    req.currentUser.ownsToken = token => !!refreshTokens.find(x => x.token === token);
    return next();
  } catch (e) {
    Logger.error('🔥 Error attaching owns token to req: %o', e);
    return next(e);
  }
};

export default attachOwnsToken;
