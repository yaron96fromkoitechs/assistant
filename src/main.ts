import { Container } from 'inversify';

import { App } from 'app';
import { TYPES } from 'types';

import { IConfigService } from 'utils/config/config.interface';
import { ConfigService } from 'utils/config/config.service';
import { ILoggerService } from 'utils/logger/logger.interface';
import { LoggerService } from 'utils/logger/logger.service';
import { IFileService } from 'utils/file/file.interface';
import { FileService } from 'utils/file/file.service';
import { IGptService } from 'utils/gpt/gpt.interface';
import { GptService } from 'utils/gpt/gpt.service';

import { TelegramBot } from 'common/telegram';
import { ChatSceneHandler } from 'entities/chat/chat.scene';
import { UserSettingsSceneHandler } from 'entities/user/settings/user.settings.scene';

import { WebServer } from 'common/web';
import { IChatController } from 'entities/chat/chat.controller.interface';
import { ChatController } from 'entities/chat/chat.controller';

const appContainer = new Container();

appContainer
  .bind<ILoggerService>(TYPES.ILoggerService)
  .to(LoggerService)
  .inSingletonScope();
appContainer
  .bind<IConfigService>(TYPES.IConfigService)
  .to(ConfigService)
  .inSingletonScope();
appContainer
  .bind<IFileService>(TYPES.IFileService)
  .to(FileService)
  .inSingletonScope();
appContainer
  .bind<IGptService>(TYPES.IGptService)
  .to(GptService)
  .inSingletonScope();

appContainer
  .bind<TelegramBot>(TYPES.TelegramBot)
  .to(TelegramBot)
  .inSingletonScope();
appContainer
  .bind<ChatSceneHandler>(TYPES.ChatSceneHandler)
  .to(ChatSceneHandler)
  .inSingletonScope();
appContainer
  .bind<UserSettingsSceneHandler>(TYPES.UserSettingsSceneHandler)
  .to(UserSettingsSceneHandler)
  .inSingletonScope();

appContainer.bind<WebServer>(TYPES.WebServer).to(WebServer).inSingletonScope();
appContainer
  .bind<IChatController>(TYPES.IChatController)
  .to(ChatController)
  .inSingletonScope();

appContainer.bind<App>(TYPES.Application).to(App).inSingletonScope();

const app = appContainer.get<App>(TYPES.Application);
app.init();
