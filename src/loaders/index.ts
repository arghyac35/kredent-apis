import expressLoader from './express';
import dependencyInjectorLoader from './dependencyInjector';
import mongooseLoader from './mongoose';
import Logger from './logger';
//We have to import at least all the events once so they can be triggered
import './events';

export default async ({ expressApp }) => {
  await mongooseLoader();
  Logger.info('✌️ DB loaded and connected!');

  /**
   * What is going on here?
   *
   * We are injecting the mongoose models into the DI container.
   * I know this is controversial but will provide a lot of flexibility at the time
   * of writing unit tests, just go and check how beautiful they are!
   */
  const userModel = {
    name: 'userModel',
    model: require('../models/user').default,
  };

  const postModel = {
    name: 'postModel',
    model: require('../models/post').default,
  };

  const commentsModel = {
    name: 'commentsModel',
    model: require('../models/comments').default,
  };

  await dependencyInjectorLoader({
    models: [
      userModel,
      postModel,
      commentsModel
    ],
  });
  Logger.info('✌️ Dependency Injector loaded');

  await expressLoader({ app: expressApp });
  Logger.info('✌️ Express loaded');
};
