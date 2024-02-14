import { injectable } from 'inversify';
import { Logger, ILogObj } from 'tslog';
import { ILoggerService } from './logger.interface';

@injectable()
export class LoggerService implements ILoggerService {
  public logger: Logger<ILogObj>;

  constructor() {
    this.logger = new Logger<ILogObj>({
      hideLogPositionForProduction: true
    });
  }

  log(...args: unknown[]): void {
    this.logger.info(...args);
  }

  error(...args: unknown[]): void {
    // sentry / rollbar
    this.logger.error(...args);
  }

  warn(...args: unknown[]): void {
    this.logger.warn(...args);
  }
}
