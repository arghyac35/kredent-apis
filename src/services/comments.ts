import { Service, Inject } from 'typedi';
import { IComment, ICommentInputDTO } from '../interfaces/IComment';

@Service()
export default class CommentsService {
  constructor(
    @Inject('commentsModel') private commentsModel: Models.CommentModel,
    @Inject('logger') private logger
  ) { }

  public async addComment(data: ICommentInputDTO): Promise<any> {
    await this.commentsModel.create(data);

    return this.fetchCommentsByPost(data.post);
  }

  public async deleteComment(commentId: string): Promise<any> {
    const deletedComment = await this.commentsModel.findByIdAndDelete(commentId, { new: true });
    return this.fetchCommentsByPost(deletedComment.post);
  }

  public async fetchCommentsByPost(postID: string): Promise<{ comments: IComment[], postID: string }> {
    try {
      const rec = (comment: IComment, allComments: IComment[]) => {
        allComments.forEach((c: IComment) => {
          if (c._id.toString() === comment.parentId.toString()) {
            Reflect.deleteProperty(comment, 'replies');
            c.replies.push(comment);
            return;
          }

          if (c.replies && c.replies.length > 0) {
            rec(comment, c.replies)
          }
        });
      };

      const allcomments = await this.commentsModel.find({ post: postID }).populate('user', 'name').populate('post').sort('-createdAt').lean();

      let finalcommets: IComment[] = [];

      allcomments.forEach((comment: IComment) => {
        if (!comment.user) {
          return;
        }
        comment.replies = [];
        let parentId = comment.parentId;
        if (!parentId) {
          finalcommets.push(comment);
          return;
        }
        rec(comment, finalcommets);
      });

      return { comments: finalcommets, postID };
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }
}
