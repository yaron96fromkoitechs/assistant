import { injectable, inject } from 'inversify';
import 'reflect-metadata';
import { NextFunction, Request, Response } from 'express';

import { ILoggerService } from 'utils/logger/logger.interface';
import { IConfigService } from 'utils/config/config.interface';
import { BaseController } from 'common/web/common/base.controller';
import { IChatController } from './chat.controller.interface';

import { TYPES } from 'types';

@injectable()
export class ChatController extends BaseController implements IChatController {
  constructor(
    @inject(TYPES.ILoggerService) private loggerService: ILoggerService,
    @inject(TYPES.IConfigService) private configService: IConfigService
  ) {
    super(loggerService);
    this.bindRoutes([
      {
        path: '/history',
        method: 'get',
        func: this.getHistory,
        middlewares: [
          //
        ]
      }
    ]);
  }

  async getHistory(
    req: Request<{}, {}>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    console.log('getHistory');
  }
}
