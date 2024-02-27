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
import { QueueService } from 'utils/queue/queue.service';
import { TelegramService } from 'utils/telegram/telegram.service';
import { PrismaService } from 'database/prisma.service';

import { TelegramBot } from 'common/telegram';
import { ChatSceneHandler } from 'entities/chat/chat.scene';
import { UserSettingsSceneHandler } from 'entities/user/bio/user.bio.scene';
import { MealsSceneHandler } from 'entities/meal/meal.scene';

import { WebServer } from 'common/web';
import { IChatController } from 'entities/chat/chat.controller.interface';
import { ChatController } from 'entities/chat/chat.controller';

import { IUserRepository } from 'entities/user/user.repository.interface';
import { UserRepository } from 'entities/user/user.repository';
import { IUserService } from 'entities/user/user.service.interface';
import { UserService } from 'entities/user/user.service';

import { IMealRepository } from 'entities/meal/user.meal.repository.interface';
import { MealRepository } from 'entities/meal/user.meal.repository';
import { IMealService } from 'entities/meal/user.meal.service.interface';
import { MealService } from 'entities/meal/user.meal.service';

const appContainer = new Container();

appContainer
  .bind<IUserRepository>(TYPES.IUserRepository)
  .to(UserRepository)
  .inSingletonScope();
appContainer
  .bind<IUserService>(TYPES.IUserService)
  .to(UserService)
  .inSingletonScope();
appContainer
  .bind<IMealRepository>(TYPES.IMealRepository)
  .to(MealRepository)
  .inSingletonScope();
appContainer
  .bind<IMealService>(TYPES.IMealService)
  .to(MealService)
  .inSingletonScope();

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
  .bind<PrismaService>(TYPES.PrismaService)
  .to(PrismaService)
  .inSingletonScope();

appContainer
  .bind<QueueService>(TYPES.QueueService)
  .to(QueueService)
  .inSingletonScope();

appContainer
  .bind<TelegramBot>(TYPES.TelegramBot)
  .to(TelegramBot)
  .inSingletonScope();
appContainer
  .bind<TelegramService>(TYPES.TelegramService)
  .to(TelegramService)
  .inSingletonScope();
appContainer
  .bind<ChatSceneHandler>(TYPES.ChatSceneHandler)
  .to(ChatSceneHandler)
  .inSingletonScope();
appContainer
  .bind<UserSettingsSceneHandler>(TYPES.UserSettingsSceneHandler)
  .to(UserSettingsSceneHandler)
  .inSingletonScope();
appContainer
  .bind<MealsSceneHandler>(TYPES.MealSceneHandler)
  .to(MealsSceneHandler)
  .inSingletonScope();

appContainer.bind<WebServer>(TYPES.WebServer).to(WebServer).inSingletonScope();
appContainer
  .bind<IChatController>(TYPES.IChatController)
  .to(ChatController)
  .inSingletonScope();

appContainer.bind<App>(TYPES.Application).to(App).inSingletonScope();

const app = appContainer.get<App>(TYPES.Application);
app.init();
