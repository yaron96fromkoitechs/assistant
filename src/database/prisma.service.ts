import { PrismaClient } from '@prisma/client';
import { inject, injectable } from 'inversify';
import { TYPES } from 'types';

import { ILoggerService } from 'utils/logger/logger.interface';

@injectable()
export class PrismaService {
  client: PrismaClient;

  constructor(@inject(TYPES.ILoggerService) private logger: ILoggerService) {
    this.client = new PrismaClient();
  }

  async init(): Promise<void> {
    await this.connect();
  }

  async connect(): Promise<void> {
    try {
      await this.client.$connect();
      this.logger.log('[PrismaService] Successfully connected to database');
    } catch (e) {
      if (e instanceof Error) {
        this.logger.log(
          `[PrismaService] Error when connecting to database: ${e.message}`
        );
      }
    }
  }

  async disconnect(): Promise<void> {
    await this.client.$disconnect();
  }
}
