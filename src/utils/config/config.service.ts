import { injectable } from 'inversify';
import { DotenvParseOutput, config } from 'dotenv';

import { IConfigService } from './config.interface';

@injectable()
export class ConfigService implements IConfigService {
  private config: DotenvParseOutput;

  constructor() {
    const { error, parsed } = config();
    if (error) {
      throw new Error('File .env not found.');
    }
    if (!parsed) {
      throw new Error('File .env is empty.');
    }
    this.config = parsed;
  }

  get(key: string): string {
    const res = this.config[key];
    if (!res) {
      throw new Error(`Key ${key} not found.`);
    }
    return res;
  }
}
