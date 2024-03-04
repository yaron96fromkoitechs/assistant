import { UserModel } from '@prisma/client';

export interface IUserService {
  createUserByTelegram: (telegramId: number) => Promise<UserModel | null>;
  getUserByTelegram: (telegramId: number) => Promise<UserModel | null>;
  getUserIdByTelegramId: (telegramId: number) => Promise<number>;
  getLocale: (userId: number) => Promise<string>;
  setLocale: (userId: number, locale: string) => Promise<string>;
  setNutriReportThreadId: (
    userId: number,
    nutriReportThreadId: string
  ) => Promise<string>;
  getNutriReportThreadId: (userId: number) => Promise<string>;
}
