import { Document, Model } from 'mongoose';
import { IComment } from '../../interfaces/IComment';
import { IPost } from '../../interfaces/IPost';
import { IRefreshToken } from '../../interfaces/IRefreshToken';
import { IUser } from '../../interfaces/IUser';

declare global {
  namespace Express {
    export interface Request {
      currentUser: IUser & Document;
    }
  }

  namespace Models {
    export type UserModel = Model<IUser & Document>;
    export type RefreshTokenModel = Model<IRefreshToken & Document>;
    export type PostModel = Model<IPost & Document>;
    export type CommentModel = Model<IComment & Document>;
  }
}
