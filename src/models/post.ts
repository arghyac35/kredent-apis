import { IPost } from '../interfaces/IPost';
import mongoose from 'mongoose';
mongoose.set("useFindAndModify", false);
const Schema = mongoose.Schema;

const postSchema = new Schema(
  {
    details: {
      type: String,
      required: [true, 'Please enter details'],
      index: true,
    },

    user: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User'
    }

  },
  { timestamps: true },
);

export default mongoose.model<IPost & mongoose.Document>('post', postSchema);
