import { IRefreshToken } from '../interfaces/IRefreshToken';
import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const schema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User' },
  token: String,
  expires: Date,
  createdByIp: String,
  revoked: Date,
  revokedByIp: String,
  replacedByToken: String
});

schema.virtual('isExpired').get(function () {
  return Date.now() >= this.expires;
});

schema.virtual('isActive').get(function () {
  return !this.revoked && !this.isExpired;
});

schema.set('toJSON', {
  virtuals: true,
  versionKey: false
});

export default mongoose.model<IRefreshToken & mongoose.Document>('RefreshToken', schema);
