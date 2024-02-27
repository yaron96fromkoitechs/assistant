import { UserModel } from '.prisma/client';
import { inject, injectable } from 'inversify';
import { User } from './user.entity';
import { IUserService } from './user.service.interface';
import { IConfigService } from 'utils/config/config.interface';
import { IUserRepository } from './user.repository.interface';
import { TYPES } from 'types';

@injectable()
export class UserService implements IUserService {
  constructor(
    @inject(TYPES.IConfigService) private configService: IConfigService,
    @inject(TYPES.IUserRepository) private userRepository: IUserRepository
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
}
