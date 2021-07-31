import { Router, Request, Response, NextFunction } from 'express';
import { Container } from 'typedi';
import AuthService from '../../services/auth';
import { IUserInputDTO } from '../../interfaces/IUser';
import { celebrate, Joi, Segments } from 'celebrate';
import { Logger } from 'winston';
import middlewares from '../middlewares';

const route = Router();

const setTokenCookie = (res: Response, token: string) => {
  // create http only cookie with refresh token that expires in 7 days
  res.cookie('refreshToken', token, {
    httpOnly: process.env.NODE_ENV === 'production',
    sameSite: 'none',
    secure: true,
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  });
}

export default (app: Router) => {
  app.use('/auth', route);

  route.post(
    '/signup',
    celebrate({
      body: Joi.object({
        name: Joi.string().required(),
        email: Joi.string().required(),
        password: Joi.string().required(),
      }),
    }),
    async (req: Request, res: Response, next: NextFunction) => {
      const logger: Logger = Container.get('logger');
      logger.debug('Calling Sign-Up endpoint with body: %o', req.body)
      try {
        const authServiceInstance = Container.get(AuthService);
        const result = await authServiceInstance.SignUp(req.body as IUserInputDTO);
        return res.status(201).json(result);
      } catch (e) {
        logger.error('🔥 error: %o', e);
        return next(e);
      }
    },
  );

  route.post(
    '/signin',
    celebrate({
      [Segments.BODY]: Joi.object({
        email: Joi.string().required(),
        password: Joi.string().required(),
      }),
    }),
    async (req: Request, res: Response, next: NextFunction) => {
      const logger: Logger = Container.get('logger');
      logger.debug('Calling Sign-In endpoint')
      try {
        const { email, password } = req.body;
        const authServiceInstance = Container.get(AuthService);
        const { user, token, refreshToken, message } = await authServiceInstance.SignIn(email, password, req.ip);
        setTokenCookie(res, refreshToken);
        return res.json({ user, token, message }).status(200);
      } catch (e) {
        logger.error('🔥 error: %o', e);
        return next(e);
      }
    },
  );

  route.post(
    '/refreshToken',
    async (req: Request, res: Response, next: NextFunction) => {
      const logger: Logger = Container.get('logger');
      logger.debug('Calling refreshToken endpoint')
      try {
        const rt = req.cookies?.refreshToken;
        const ipAddress = req.ip;
        const authServiceInstance = Container.get(AuthService);
        const { user, token, refreshToken, message } = await authServiceInstance.refreshToken({ token: rt, ipAddress });
        setTokenCookie(res, refreshToken);
        return res.json({ user, token, message }).status(200);
      } catch (e) {
        logger.error('🔥 error: %o', e);
        return next(e);
      }
    },
  );

  route.post('/revokeToken',
    celebrate({
      [Segments.BODY]: Joi.object({
        token: Joi.string().empty('')
      }),
    }),
    middlewares.isAuth, middlewares.attachCurrentUser, middlewares.attachOwnsToken,
    async (req: Request, res: Response, next: NextFunction) => {
      const logger: Logger = Container.get('logger');
      logger.debug('Calling revokeToken endpoint')
      try {
        // accept token from request body or cookie
        const token = req.body.token || req.cookies.refreshToken;
        const ipAddress = req.ip;

        if (!token) return res.status(400).json({ message: 'Token is required' });

        // users can revoke their own tokens and admins can revoke any tokens
        if (!req.currentUser.ownsToken(token) && req.currentUser.role !== 'admin') {
          return res.status(401).json({ message: 'Unauthorized' });
        }

        const authServiceInstance = Container.get(AuthService);
        await authServiceInstance.revokeToken({ token, ipAddress });

        return res.status(200).json({ message: req.t('tokenRevoke') })

      } catch (e) {
        logger.error('🔥 error: %o', e);
        return next(e);
      }
    });

};
