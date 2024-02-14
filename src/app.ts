import { inject, injectable } from 'inversify';

import { TelegramBot } from 'common/telegram';
import { WebServer } from 'common/web';

import { TYPES } from 'types';

@injectable()
export class App {
  private telegramBot: TelegramBot;
  private webServer: WebServer;

  constructor(
    @inject(TYPES.TelegramBot) telegramBot: TelegramBot,
    @inject(TYPES.WebServer) webServer: WebServer
  ) {
    this.telegramBot = telegramBot;
    this.webServer = webServer;
  }

  init() {
    this.telegramBot.init();
    this.webServer.init();
  }
}
