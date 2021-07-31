import { Router, Request, Response, NextFunction } from 'express';
import middlewares from '../middlewares';
import { Container } from 'typedi';
import UserService from '../../services/user';
import { Logger } from 'winston';

const route = Router();

export default (app: Router) => {
  app.use('/users', route);

  route.get('/me', middlewares.isAuth, middlewares.attachCurrentUser, (req: Request, res: Response) => {
    return res.json({ user: req.currentUser }).status(200);
  });

  route.get('/:id?', middlewares.isAuth, middlewares.attachCurrentUser, async (req: Request, res: Response, next: NextFunction) => {
    const logger: Logger = Container.get('logger');
    logger.debug('Calling users endpoint')
    try {
      const userServiceInstance = Container.get(UserService);
      const { users } = await userServiceInstance.getAllUsers(req.currentUser, req.params.id);
      return res.status(201).json({ users });
    } catch (e) {
      logger.error('🔥 error: %o', e);
      return next(e);
    }
  });
};
