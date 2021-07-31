import i18next from 'i18next';
import { Service, Inject } from 'typedi';
import { IPost, IPostInputDTO } from '../interfaces/IPost';
import { IUser } from '../interfaces/IUser';

@Service()
export default class PostService {
  constructor(
    @Inject('postModel') private postModel: Models.PostModel,
    @Inject('logger') private logger,
  ) { }

  public async addPost(postInputDTO: IPostInputDTO, currentUser: IUser): Promise<{ post: IPost; message: string }> {
    try {
      this.logger.info('====Add post starts====');

      postInputDTO.user = currentUser._id;

      let post = await this.postModel.create(postInputDTO);

      post = await post.populate('user').execPopulate();

      this.logger.info('====Add post ends====');
      return { post, message: i18next.t('addSuccess') }
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }
}
