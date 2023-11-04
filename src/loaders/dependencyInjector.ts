import { Container } from 'typedi';
import LoggerInstance from './logger';

export default async ({ models }: { models: { name: string; model: any }[] }): Promise<any> => {
  try {
    models.forEach((m) => {
      Container.set(m.name, m.model);
    });

    Container.set('logger', LoggerInstance);
  } catch (e) {
    LoggerInstance.error('🔥 Error on dependency injector loader: %o', e);
    throw e;
  }
};
