import { IUser } from '../interfaces/IUser';
import mongoose from 'mongoose';
mongoose.set("useFindAndModify", false);

const User = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please enter a full name'],
      index: true,
    },

    email: {
      type: String,
      lowercase: true,
      unique: true,
      index: true,
    },

    password: String,

    salt: String,

    role: {
      type: String,
      default: 'user',
    },

    lastLogin: Date
  },
  { timestamps: true },
);

export default mongoose.model<IUser & mongoose.Document>('User', User);
