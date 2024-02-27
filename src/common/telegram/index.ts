import path from 'path';
import { Scenes, session } from 'telegraf';
import I18n from 'telegraf-i18n';
import { Redis } from '@telegraf/session/redis';

import { ILoggerService } from 'utils/logger/logger.interface';
import { IConfigService } from 'utils/config/config.interface';

import { BaseSceneHandler, Handler, Scene } from './handlers/handler.class';
import { StartCommandHandler } from './handlers/commands/start.command';
import { ChatSceneHandler } from 'entities/chat/chat.scene';
import { UserSettingsSceneHandler } from 'entities/user/bio/user.bio.scene';

import { inject, injectable } from 'inversify';
import { TYPES } from 'types';
import { TelegramService } from 'utils/telegram/telegram.service';
import { MealsSceneHandler } from 'entities/meal/meal.scene';

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
  ) {
    this.init();
  }

  private init() {
    this.logger.log('[TELEGRAM BOT]', 'INIT');

    if (this.config.get('ENVIRONMENT') === 'PRODUCTION') {
      this.telegramService.bot.createWebhook({
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

    const i18n = new I18n({
      useSession: true,
      defaultLanguage: 'en',
      defaultLanguageOnMissing: true,
      // allowMissing: false, // Default true
      directory: path.resolve('src/common/locales')
    });

    this.telegramService.bot.use(i18n.middleware());
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
