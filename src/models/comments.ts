import { IComment } from '../interfaces/IComment';
import mongoose from 'mongoose';
var Schema = mongoose.Schema;

const comments = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    comment: {
      type: String,
      required: true
    },
    post: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'post'
    },
    parentId: {
      type: Schema.Types.ObjectId,
      default: null,
      ref: 'comments',
    }
  },
  { timestamps: true },
);

export default mongoose.model<IComment & mongoose.Document>('comments', comments);
