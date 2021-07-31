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

  public async fetchAllPostPaginated(queries: any) {
    try {
      let filter: any = {};
      let pageNo = parseInt(queries.pageNo)
      let size = parseInt(queries.size)
      let sort = '';

      let query: { skip: number, limit: number } = {
        skip: 0,
        limit: 0
      };
      if (queries.sortBy) {
        if (queries.sortDirection === 'asc') {
          sort = queries.sortBy;
        } else if (queries.sortDirection === 'desc') {
          sort = '-' + queries.sortBy
        }
      }

      query.skip = size * (pageNo - 1)
      query.limit = size

      let total = await this.postModel.countDocuments(filter);
      const users = await this.postModel.find(filter, {}, query).populate('user', 'name').sort(sort).lean();
      let totalPages = Math.ceil(total / size)
      return { "data": users, totalPages, "totalItems": total };
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  public async fetchPostById(id: string): Promise<{ post: IPost; message: string }> {
    try {
      this.logger.info('====fetchPostById starts====');

      const post = await this.postModel.findById(id).populate('user', 'name');

      this.logger.info('====fetchPostById  ends====');
      return { post, message: i18next.t('fetchSuccess') }
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }
}
