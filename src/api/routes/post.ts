import { Router, Request, Response, NextFunction } from 'express';
import middlewares from '../middlewares';
import { Container } from 'typedi';
import { Logger } from 'winston';
import { celebrate, Joi, Segments } from 'celebrate';
import PostService from '../../services/post';

const route = Router();

export default (app: Router) => {
  app.use('/post', route);

  route.post('/add', celebrate({
    [Segments.BODY]: Joi.object({
      details: Joi.string().required()
    }),
  }),
    middlewares.isAuth, middlewares.attachCurrentUser,
    async (req: Request, res: Response, next: NextFunction) => {
      const logger: Logger = Container.get('logger');
      logger.debug('Calling users endpoint')
      try {
        const postServiceInstance = Container.get(PostService);
        const result = await postServiceInstance.addPost(req.body, req.currentUser);
        return res.status(201).json(result);
      } catch (e) {
        logger.error('🔥 error: %o', e);
        return next(e);
      }
    });
};
