import { inject, injectable } from 'inversify';

import { RedisClientType, createClient } from 'redis';

import { IConfigService } from 'utils/config/config.interface';
import { ILoggerService } from 'utils/logger/logger.interface';

import { TYPES } from 'types';

@injectable()
export class RedisService {
  private prefix: string;

  private client: RedisClientType;

  constructor(
    @inject(TYPES.IConfigService) private readonly config: IConfigService,
    @inject(TYPES.ILoggerService) private readonly logger: ILoggerService
  ) {
    this.prefix = 'app';

    this.client = createClient({
      socket: {
        host: this.config.get('REDIS_HOST').split('::/')[1],
        port: Number(this.config.get('REDIS_PORT'))
      }
    });
  }

  public async init() {
    await this.client.connect();
    this.logger.log('[REDIS SERVICE]', 'CONNECTED');
  }

  public set(key: string, value: string) {
    return this.client.set(`${this.prefix}:${key}`, value);
  }

  public get(key: string): Promise<string> {
    return this.client.get(`${this.prefix}:${key}`);
  }
}
