import { Router } from 'express';
import auth from './routes/auth';
import user from './routes/user';
import post from './routes/post';

// guaranteed to get dependencies
export default () => {
  const app = Router();
  auth(app);
  user(app);
  post(app);

  return app
}
