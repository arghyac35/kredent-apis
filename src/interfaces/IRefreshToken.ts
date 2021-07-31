export interface IRefreshToken {
  _id: string;
  user: string;
  token: string;
  expires: Date;
  createdByIp: string;
  revoked: Date;
  revokedByIp: string;
  replacedByToken: string;
  isExpired: boolean;
  isActive: boolean;
}

export interface IRefreshTokenInputDTO {
  user: string;
  token: string;
  expires: Date;
  createdByIp: string;
  revoked?: Date;
  revokedByIp?: string;
  replacedByToken?: string;
}
