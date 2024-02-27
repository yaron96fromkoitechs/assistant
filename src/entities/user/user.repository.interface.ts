import { UserModel } from '@prisma/client';
import { User } from './user.entity';

export interface IUserRepository {
  createByTelegramId: (user: User) => Promise<UserModel>;
  findByTelegramId: (telegramId: number) => Promise<UserModel | null>;
}
