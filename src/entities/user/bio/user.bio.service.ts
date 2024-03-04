import { inject, injectable } from 'inversify';

import { IUserRepository } from '../user.repository.interface';
import { RedisService } from 'utils/redis/redis.service';

import { TGender, TGoal, TMeasureSystem } from 'common/types';
import { TYPES } from 'types';

@injectable()
export class UserBioService {
  constructor(
    @inject(TYPES.IUserRepository) private userRepository: IUserRepository,
    @inject(TYPES.RedisService) private redis: RedisService
  ) {}

  //TODO: queue set in DB

  async setLocale(userId: number, locale: string): Promise<void> {
    await this.redis.set(`user:${userId}:locale`, locale);
  }

  async getLocale(userId: number): Promise<string> {
    return this.redis.get(`user:${userId}:locale`);
  }

  async setName(userId: number, name: string): Promise<void> {
    await this.redis.set(`user:${userId}:name`, name);
  }

  async getName(userId: number): Promise<string> {
    return this.redis.get(`user:${userId}:name`);
  }

  async setGender(userId: number, gender: TGender) {
    return this.redis.set(`user:${userId}:gender`, gender);
  }

  async getGender(userId: number) {
    return this.redis.get(`user:${userId}:gender`);
  }

  async setAge(userId: number, age: number) {
    return this.redis.set(`user:${userId}:age`, age.toString());
  }

  async getAge(userId: number) {
    return this.redis.get(`user:${userId}:age`);
  }

  async setMeasurementSystem(userId: number, measureSystem: TMeasureSystem) {
    return this.redis.set(`user:${userId}:measure_system`, measureSystem);
  }

  async getMeasurementSystem(userId: number) {
    return this.redis.get(`user:${userId}:measure_system`);
  }

  async setHeight(userId: number, height: number) {
    return this.redis.set(`user:${userId}:height`, height.toString());
  }

  async getHeight(userId: number) {
    return this.redis.get(`user:${userId}:height`);
  }

  async setWeight(userId: number, weight: number) {
    return this.redis.set(`user:${userId}:weight`, weight.toString());
  }

  async getWeight(userId: number) {
    return this.redis.get(`user:${userId}:weight`);
  }

  async setGoal(userId: number, goal: TGoal) {
    return this.redis.set(`user:${userId}:goal`, goal);
  }

  async getGoal(userId: number) {
    return this.redis.get(`user:${userId}:goal`);
  }
}
