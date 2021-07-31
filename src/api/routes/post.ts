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

  route.get('/all',
    celebrate({
      [Segments.HEADERS]: Joi.object({
        authorization: Joi.string().required()
      }).unknown(),
      [Segments.QUERY]: Joi.object({
        pageNo: Joi.number().required().min(1),
        size: Joi.number().required().min(1),
        sortBy: Joi.string().empty('').optional(),
        sortDirection: Joi.string().empty('').optional()
      })
    }),
    middlewares.isAuth, middlewares.attachCurrentUser,
    async (req: Request, res: Response, next: NextFunction) => {
      const logger: Logger = Container.get('logger');
      logger.debug('Calling users/all endpoint')
      try {
        const postServiceInstance = Container.get(PostService);
        const result = await postServiceInstance.fetchAllPostPaginated(req.query);
        return res.status(200).json(result);
      } catch (e) {
        logger.error('🔥 error: %o', e);
        return next(e);
      }
    });

  route.get('/single/:id', celebrate({
    [Segments.HEADERS]: Joi.object({
      authorization: Joi.string().required()
    }).unknown(),
  }),
    middlewares.isAuth, middlewares.attachCurrentUser,
    async (req: Request, res: Response, next: NextFunction) => {
      const logger: Logger = Container.get('logger');
      logger.debug('Calling users endpoint')
      try {
        const postServiceInstance = Container.get(PostService);
        const result = await postServiceInstance.fetchPostById(req.params.id);
        return res.status(200).json(result);
      } catch (e) {
        logger.error('🔥 error: %o', e);
        return next(e);
      }
    });
};
