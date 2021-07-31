import { readFileSync } from 'fs';
import { Container } from 'typedi';
import LoggerInstance from './logger';

export default async ({ models }: { models: { name: string; model: any }[] }): Promise<any> => {
  try {
    models.forEach(m => {
      Container.set(m.name, m.model);
    });

    const privateJWTRS256Key = readFileSync('./keys/jwtRS256.key');
    const publicJWTRS256Key = readFileSync('./keys/jwtRS256.key.pub');
    Container.set('privateJWTRS256Key', privateJWTRS256Key);
    Container.set('publicJWTRS256Key', publicJWTRS256Key);

    Container.set('logger', LoggerInstance)
  } catch (e) {
    LoggerInstance.error('🔥 Error on dependency injector loader: %o', e);
    throw e;
  }
};
