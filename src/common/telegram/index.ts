import { inject, injectable } from 'inversify';

import path from 'path';
import { Scenes, session } from 'telegraf';
import { Redis } from '@telegraf/session/redis';

import { ILoggerService } from 'utils/logger/logger.interface';
import { IConfigService } from 'utils/config/config.interface';

import { BaseSceneHandler, Handler, Scene } from './handlers/handler.class';
import { StartCommandHandler } from './handlers/commands/start.command';
import { ChatSceneHandler } from 'entities/chat/chat.scene';
import { UserSettingsSceneHandler } from 'entities/user/bio/user.bio.scene';

import { TelegramService } from 'utils/telegram/telegram.service';
import { MealsSceneHandler } from 'entities/meal/meal.scene';

import { TYPES } from 'types';

@injectable()
export class TelegramBot {
  private handlers: Handler[] = [];
  private baseSceneHandlers: BaseSceneHandler[] = [];
  private wizardScenes: Scene[] = [];

  constructor(
    @inject(TYPES.ILoggerService)
    private readonly logger: ILoggerService,
    @inject(TYPES.IConfigService)
    private readonly config: IConfigService,
    @inject(TYPES.TelegramService)
    public readonly telegramService: TelegramService,

    @inject(TYPES.ChatSceneHandler)
    private readonly chatSceneHandler: ChatSceneHandler,
    @inject(TYPES.UserSettingsSceneHandler)
    private readonly userSettingsSceneHandler: UserSettingsSceneHandler,
    @inject(TYPES.MealSceneHandler)
    private readonly mealSceneHandler: MealsSceneHandler
  ) {}

  public async init() {
    if (this.config.get('ENVIRONMENT') === 'PRODUCTION') {
      await this.telegramService.bot.createWebhook({
        domain: this.config.get('DOMAIN')
      });
    }

    this.gracefulShutdown();
    this.middleware();
    this.handle();

    this.telegramService.bot.launch();
    this.logger.log('[TELEGRAM BOT]', 'LAUNCHED');
  }

  private middleware() {
    const redisStore: any = Redis({
      url: `${this.config.get('REDIS_HOST')}:${this.config.get('REDIS_PORT')}`
    });

    this.telegramService.bot.use(session({ store: redisStore }));
  }

  private handle() {
    this.baseSceneHandlers = [this.chatSceneHandler, this.mealSceneHandler];
    this.wizardScenes = [this.userSettingsSceneHandler];
    for (const handler of this.baseSceneHandlers) {
      handler.handle();
    }
    const stage = new Scenes.Stage([
      ...this.baseSceneHandlers.map((handler) => handler.scene),
      ...this.wizardScenes.map((handler) => handler.scene)
    ]);
    this.telegramService.bot.use(stage.middleware());
    this.handlers = [new StartCommandHandler(this.telegramService.bot)];
    for (const handler of this.handlers) {
      handler.handle();
    }
  }

  private gracefulShutdown() {
    process.once('SIGINT', () => {
      this.telegramService.bot.stop('SIGINT');
      this.logger.log('[TELEGRAM BOT]', 'STOPPED');
    });
    process.once('SIGTERM', () => {
      this.telegramService.bot.stop('SIGTERM');
      this.logger.log('[TELEGRAM BOT]', 'STOPPED');
    });
  }
}
