import { Service, Inject } from 'typedi';
import { IUser } from '../interfaces/IUser';
import _ from 'lodash';
import argon2 from 'argon2';
import { randomBytes } from 'crypto';

@Service()
export default class UserService {
  constructor(
    @Inject('userModel') private userModel: Models.UserModel,
    @Inject('logger') private logger
  ) { }


  public async getAllUsers(currentUser: IUser, userId: string): Promise<{ users: IUser[] | IUser }> {
    // Find all users
    // TODO: exclude admins, I want only I can see admin users
    try {
      let users;
      if (userId) {
        const user = await this.userModel.findOne({ _id: userId })
        users = user.toObject();
      } else {
        users = await this.userModel.find();
      }
      if (_.isEmpty(users)) {
        throw new Error('Users/Users doesnt exists');
      }
      return { users }
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

}
