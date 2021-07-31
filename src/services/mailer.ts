import { Service, Inject } from 'typedi';
import { IUser } from '../interfaces/IUser';
import { GMailService } from './gmail';

@Service()
export default class MailerService {
  constructor() { }

  public async SendWelcomeEmail(userRecord: IUser) {
    const gmailService = new GMailService();

    return await gmailService.sendMail(userRecord.email, 'Welcome to GroceryEcom', '', `Hey ${userRecord.name}, thanks for registering to my shop.`, {});
  }
  public StartEmailSequence(sequence: string, user: Partial<IUser>) {
    if (!user.email) {
      throw new Error('No email provided');
    }
    // @TODO Add example of an email sequence implementation
    // Something like
    // 1 - Send first email of the sequence
    // 2 - Save the step of the sequence in database
    // 3 - Schedule job for second email in 1-3 days or whatever
    // Every sequence can have its own behavior so maybe
    // the pattern Chain of Responsibility can help here.
    return { delivered: 1, status: 'ok' };
  }
}
