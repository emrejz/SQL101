export interface IUser {
  id?: number;
  username?: string;
  password?: string;
  createdAt?: Date;
  updatedAt?: Date;
  role?: EUserRole;
}

export enum EUserRole {
  admin = 'admin',
  editor = 'editor',
  user = 'user',
}
