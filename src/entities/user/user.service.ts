import { inject, injectable } from 'inversify';

import { UserModel } from '.prisma/client';

import { User } from './user.entity';
import { IUserRepository } from './user.repository.interface';

import { IUserService } from './user.service.interface';
import { RedisService } from 'utils/redis/redis.service';

import { TYPES } from 'types';

@injectable()
export class UserService implements IUserService {
  constructor(
    @inject(TYPES.IUserRepository) private userRepository: IUserRepository,
    @inject(TYPES.RedisService) private readonly redisService: RedisService
  ) {}

  async createUserByTelegram(telegramId: number): Promise<UserModel | null> {
    const newUser = new User(null, null, telegramId);

    const existedUser = await this.userRepository.findByTelegramId(telegramId);
    if (existedUser) {
      return null;
    }

    return this.userRepository.createByTelegramId(newUser);
  }

  async getUserByTelegram(telegramId: number): Promise<UserModel | null> {
    const user = await this.userRepository.findByTelegramId(telegramId);
    return user;
  }

  async getUserIdByTelegramId(telegramId: number): Promise<number> {
    const userId = await this.redisService.get(`telegram:user:${telegramId}`);
    if (userId) {
      return Number(userId);
    }
  }

  async setLocale(userId: number, locale: string): Promise<string> {
    return this.redisService.set(`user:${userId}:locale`, locale);
  }

  async getLocale(userId: number): Promise<string> {
    return this.redisService.get(`user:${userId}:locale`);
  }

  async setNutriReportThreadId(
    userId: number,
    nutriReportThreadId: string
  ): Promise<string> {
    return this.redisService.set(
      `user:${userId}:nutriReportThreadId`,
      nutriReportThreadId
    );
  }

  async getNutriReportThreadId(userId: number): Promise<string> {
    return this.redisService.get(`user:${userId}:nutriReportThreadId`);
  }
}
