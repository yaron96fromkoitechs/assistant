import { UserModel } from '@prisma/client';

export interface IUserService {
  createUserByTelegram: (telegramId: number) => Promise<UserModel | null>;
  getUserByTelegram: (telegramId: number) => Promise<UserModel | null>;
}
