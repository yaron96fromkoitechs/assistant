import { UserModel } from '@prisma/client';
import { inject, injectable } from 'inversify';
import { PrismaService } from 'database/prisma.service';
import { User } from './user.entity';
import { IUserRepository } from './user.repository.interface';

import { TYPES } from 'types';

@injectable()
export class UserRepository implements IUserRepository {
  constructor(
    @inject(TYPES.PrismaService) private prismaService: PrismaService
  ) {}

  async createByTelegramId({ telegramId }: User): Promise<UserModel> {
    return this.prismaService.client.userModel.create({
      data: {
        telegramId
      }
    });
  }

  async findByTelegramId(telegramId: number): Promise<UserModel | null> {
    return this.prismaService.client.userModel.findFirst({
      where: {
        telegramId
      }
    });
  }
}
