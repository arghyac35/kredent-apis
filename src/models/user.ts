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

User.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (doc, ret) => {
    // remove these props when object is serialized
    delete ret.password;
    delete ret.salt;
  }
});

User.set('toObject', {
  virtuals: true,
  versionKey: false,
  transform: (doc, ret) => {
    // remove these props when object is serialized
    delete ret.password;
    delete ret.salt;
  }
});

export default mongoose.model<IUser & mongoose.Document>('User', User);
