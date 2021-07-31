export interface IUser {
  _id: string;
  name: string;
  email: string;
  password: string;
  salt: string;
  role: string;
  lastLogin: Date;
  ownsToken?: any;
}

export interface IUserInputDTO {
  name: string;
  email: string;
  password: string;
  role: string;
  lastLogin: Date;
}
