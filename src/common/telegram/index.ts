import path from 'path';
import { Scenes, Telegraf, session } from 'telegraf';
import I18n from 'telegraf-i18n';
import { Redis } from '@telegraf/session/redis';

import { ILoggerService } from 'utils/logger/logger.interface';
import { IConfigService } from 'utils/config/config.interface';

import { IContext } from './context/context.interface';
import { BaseSceneHandler, Handler, Scene } from './handlers/handler.class';
import { StartCommandHandler } from './handlers/commands/start.command';
import { ChatSceneHandler } from 'entities/chat/chat.scene';
import { UserSettingsSceneHandler } from 'entities/user/settings/user.settings.scene';

import { inject, injectable } from 'inversify';
import { TYPES } from 'types';

@injectable()
export class TelegramBot {
  public bot: Telegraf<IContext>;

  private handlers: Handler[] = [];
  private baseSceneHandlers: BaseSceneHandler[] = [];
  private wizardScenes: Scene[] = [];

  constructor(
    @inject(TYPES.ILoggerService)
    private readonly logger: ILoggerService,
    @inject(TYPES.IConfigService)
    private readonly config: IConfigService,

    @inject(TYPES.ChatSceneHandler)
    private readonly chatSceneHandler: ChatSceneHandler,
    @inject(TYPES.UserSettingsSceneHandler)
    private readonly userSettingsSceneHandler: UserSettingsSceneHandler
  ) {
    this.bot = new Telegraf<IContext>(this.config.get('TELEGRAM_TOKEN'));

    if (this.config.get('ENVIRONMENT') === 'PRODUCTION') {
      this.bot.createWebhook({
        domain: this.config.get('DOMAIN')
      });
    }

    // Enable graceful stop
    process.once('SIGINT', () => {
      this.bot.stop('SIGINT');
      this.logger.log('***TELEGRAM BOT***', 'STOPPED');
    });
    process.once('SIGTERM', () => {
      this.bot.stop('SIGTERM');
      this.logger.log('***TELEGRAM BOT***', 'STOPPED');
    });
  }

  public init() {
    this.logger.log('***TELEGRAM BOT***', 'INIT');

    this.middleware();
    this.handle();

    this.bot.launch();
    this.logger.log('***TELEGRAM BOT***', 'LAUNCHED');
  }

  private middleware() {
    const redisStore: any = Redis({
      url: this.config.get('REDIS_URL')
    });

    this.bot.use(session({ store: redisStore }));

    const i18n = new I18n({
      useSession: true,
      defaultLanguage: 'en',
      // allowMissing: false, // Default true
      directory: path.resolve('src/common/locales')
    });

    this.bot.use(i18n.middleware());
  }

  private handle() {
    this.baseSceneHandlers = [this.chatSceneHandler];
    this.wizardScenes = [this.userSettingsSceneHandler];

    for (const handler of this.baseSceneHandlers) {
      handler.handle();
    }

    const stage = new Scenes.Stage([
      ...this.baseSceneHandlers.map((handler) => handler.scene),
      ...this.wizardScenes.map((handler) => handler.scene)
    ]);
    this.bot.use(stage.middleware());

    this.handlers = [new StartCommandHandler(this.bot)];
    for (const handler of this.handlers) {
      handler.handle();
    }
  }
}
