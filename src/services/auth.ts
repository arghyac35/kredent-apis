import argon2 from 'argon2';
import { randomBytes } from 'crypto';
import i18next from 'i18next';
import jwt from 'jsonwebtoken';
import { Inject, Service } from 'typedi';
import config from '../config';
import { EventDispatcher, EventDispatcherInterface } from '../decorators/eventDispatcher';
import { IUser, IUserInputDTO } from '../interfaces/IUser';
import events from '../subscribers/events';

@Service()
export default class AuthService {
  constructor(
    @Inject('userModel') private userModel: Models.UserModel,
    @Inject('logger') private logger,
    @Inject('refreshTokenModel') private refreshTokenModel: Models.RefreshTokenModel,
    @EventDispatcher() private eventDispatcher: EventDispatcherInterface,
  ) {}

  public async SignUp(userInputDTO: IUserInputDTO): Promise<{ user: IUser; message: string }> {
    try {
      const salt = randomBytes(32);

      // Check if email exists
      if (await this.userModel.exists({ email: userInputDTO.email })) {
        throw new Error(i18next.t('userExists'));
      }

      this.logger.silly('Hashing password');
      const hashedPassword = await argon2.hash(userInputDTO.password, { salt });
      this.logger.silly('Creating user db record');
      const userRecord = await this.userModel.create({
        ...userInputDTO,
        salt: salt.toString('hex'),
        password: hashedPassword,
      });

      if (!userRecord) {
        throw new Error(i18next.t('userCreate.error'));
      }

      // Fire some other events on user signUp
      this.eventDispatcher.dispatch(events.user.signUp, { user: userRecord });

      const user = userRecord.toObject();
      Reflect.deleteProperty(user, 'password');
      Reflect.deleteProperty(user, 'salt');
      return { user, message: i18next.t('userCreate.success') };
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }

  public async SignIn(
    email: string,
    password: string,
    ipAddress: string,
  ): Promise<{ message: string; user: IUser; token: string; refreshToken: string }> {
    const userRecord = await this.userModel.findOne({ email, role: 'user' });
    if (!userRecord) {
      throw new Error(i18next.t('notRegistered'));
    }
    /**
     * We use verify from argon2 to prevent 'timing based' attacks
     */
    this.logger.silly('Checking password');
    const validPassword = await argon2.verify(userRecord.password, password);
    if (validPassword) {
      this.logger.silly('Password is valid!');
      this.logger.silly('Generating JWT');
      const token = this.generateToken(userRecord);
      const refreshToken = this.generateRefreshToken(userRecord, ipAddress);

      // save refresh token
      await refreshToken.save();

      this.eventDispatcher.dispatch(events.user.signIn, userRecord);

      const user = userRecord.toObject();
      Reflect.deleteProperty(user, 'password');
      Reflect.deleteProperty(user, 'salt');
      /**
       * Easy as pie, you don't need passport.js anymore :)
       */
      return { user, token, refreshToken: refreshToken.token, message: i18next.t('signInSuccess') };
    } else {
      throw new Error(i18next.t('invalidPass'));
    }
  }

  public async refreshToken({ token, ipAddress }) {
    try {
      const refreshToken = await this.getRefreshToken(token);
      let { user } = refreshToken;

      // replace old refresh token with a new one and save
      const newRefreshToken = this.generateRefreshToken(user, ipAddress);
      refreshToken.revoked = Date.now();
      refreshToken.revokedByIp = ipAddress;
      refreshToken.replacedByToken = newRefreshToken.token;
      await refreshToken.save();
      await newRefreshToken.save();

      // generate new jwt
      const jwtToken = this.generateToken(user);

      // return basic details and tokens
      return {
        user,
        token: jwtToken,
        refreshToken: newRefreshToken.token,
        message: i18next.t('tokenRefreshed'),
      };
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  private async getRefreshToken(token: string) {
    const refreshToken: any = await this.refreshTokenModel.findOne({ token }).populate('user');
    if (!refreshToken || !refreshToken.isActive) throw new Error(i18next.t('invalidRT'));
    return refreshToken;
  }

  public async revokeToken({ token, ipAddress }) {
    const refreshToken = await this.getRefreshToken(token);

    // revoke token and save
    refreshToken.revoked = Date.now();
    refreshToken.revokedByIp = ipAddress;
    await refreshToken.save();
  }

  private generateToken(user) {
    /**
     * A JWT means JSON Web Token, so basically it's a json that is _hashed_ into a string
     * The cool thing is that you can add custom properties a.k.a metadata
     * Here we are adding the userId, role and name
     * Beware that the metadata is public and can be decoded without _the secret_
     * but the client cannot craft a JWT to fake a userId
     * because it doesn't have _the secret_ to sign it
     * more information here: https://softwareontheroad.com/you-dont-need-passport
     */
    this.logger.silly(`Sign JWT for userId: ${user._id}`);
    return jwt.sign(
      {
        _id: user._id, // We are gonna use this in the middleware 'isAuth'
        role: user.role,
        name: user.name,
      },
      config.jwtSecret,
      { algorithm: 'RS256', expiresIn: '1d' },
    );
  }

  private generateRefreshToken(user: IUser, ipAddress: string) {
    // create a refresh token that expires in 7 days
    return new this.refreshTokenModel({
      user: user._id,
      token: this.randomTokenString(),
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      createdByIp: ipAddress,
    });
  }

  private randomTokenString() {
    return randomBytes(40).toString('hex');
  }
}
