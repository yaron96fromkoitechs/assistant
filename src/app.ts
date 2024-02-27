import { inject, injectable } from 'inversify';

import { TelegramBot } from 'common/telegram';
import { WebServer } from 'common/web';

import { TYPES } from 'types';

@injectable()
export class App {
  private webServer: WebServer;

  constructor(
    @inject(TYPES.TelegramBot) telegramBot: TelegramBot,
    @inject(TYPES.WebServer) webServer: WebServer
  ) {
    this.webServer = webServer;
  }

  init() {
    this.webServer.init();
  }
}
