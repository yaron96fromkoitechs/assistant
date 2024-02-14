import { inject, injectable } from 'inversify';
import express from 'express';
import cors from 'cors';
import { Server as HttpServer } from 'http';

import { ChatController } from 'entities/chat/chat.controller';
import { IConfigService } from 'utils/config/config.interface';
import { TYPES } from 'types';
import { ILoggerService } from 'utils/logger/logger.interface';

@injectable()
export class WebServer {
  private port: string;

  private express: express.Application;
  private http: HttpServer;

  constructor(
    @inject(TYPES.IConfigService) private readonly config: IConfigService,
    @inject(TYPES.ILoggerService) private readonly logger: ILoggerService,
    @inject(TYPES.IChatController)
    private readonly chatController: ChatController
  ) {
    this.port = this.config.get('PORT');

    this.express = express();
    this.http = new HttpServer(this.express);

    // Enable graceful stop
    process.once('SIGINT', () => {
      this.http.close();
      this.logger.log('***HTTP SERVER***', 'STOPPED');
    });
    process.once('SIGTERM', () => {
      this.http.close();
      this.logger.log('***HTTP SERVER***', 'STOPPED');
    });
  }

  public init() {
    this.middleware();
    this.routes();

    this.http.listen(this.port);
    this.logger.log('***HTTP SERVER***', `LISTEN ON PORT ${this.port}`);
  }

  private middleware(): void {
    this.express.use(express.json());
    this.express.use(cors());
  }

  private routes(): void {
    this.express.use('/chat', this.chatController.router);
  }
}
