import { inject, injectable } from 'inversify';

import { Markup, Scenes } from 'telegraf';
import { message } from 'telegraf/filters';
import { BaseScene } from 'telegraf/typings/scenes';

import { IUserService } from 'entities/user/user.service.interface';
import { ChatService } from './chat.service';
import { LocaleService } from 'utils/locale/locale.service';
import { JobType, QueueService, Queues } from 'utils/queue/queue.service';

import { BaseSceneHandler } from 'common/telegram/handlers/handler.class';
import { IBaseSceneContext } from 'common/telegram/context/context.interface';

import {
  getCallbackData,
  getMessageText,
  getTextFromCallback,
  getTelegramUserId,
  getVoiceFileId
} from 'common/telegram/helpers';

import { SCENES } from 'common/telegram/scenes.types';
import { TYPES } from 'types';

@injectable()
export class ChatSceneHandler extends BaseSceneHandler {
  sceneId: string;
  scene: BaseScene<IBaseSceneContext>;

  constructor(
    @inject(TYPES.IUserService) private readonly userService: IUserService,
    @inject(TYPES.QueueService) private readonly queueService: QueueService,
    @inject(TYPES.LocaleService) private readonly localeService: LocaleService,
    @inject(TYPES.ChatService) private readonly chatService: ChatService
  ) {
    super();
    this.sceneId = SCENES.CHAT;
    this.scene = new Scenes.BaseScene<IBaseSceneContext>(this.sceneId);
  }

  handle(): void {
    this.scene.enter(async (ctx) => {
      const telegramId = getTelegramUserId(ctx);
      const userId = await this.userService.getUserIdByTelegramId(telegramId);
      const locale = await this.userService.getLocale(userId);

      const threadId = await this.chatService.getNutriReportThreadId(userId);
      if (!threadId) {
        await this.chatService.createAndSetNutriReportThreadId(userId);
      }

      const user = await this.userService.getUserByTelegram(telegramId);
      if (!user) {
        await this.userService.createUserByTelegram(telegramId);
      }

      ctx.sendMessage(
        this.localeService.t('telegram.chat.enter', locale),
        Markup.keyboard([
          [this.localeService.t('telegram.buttons.meals', locale)],
          [this.localeService.t('telegram.buttons.settings', locale)]
        ]).resize()
      );
    });

    this.scene.on(message('text'), async (ctx) => {
      const telegramId = getTelegramUserId(ctx);
      const text = getMessageText(ctx);

      const userId = await this.userService.getUserIdByTelegramId(telegramId);
      const locale = await this.userService.getLocale(userId);

      if (text === this.localeService.t('telegram.buttons.settings', locale)) {
        return ctx.scene.enter(SCENES.SETTINGS);
      } else if (
        text === this.localeService.t('telegram.buttons.meals', locale)
      ) {
        return ctx.scene.enter(SCENES.MEALS);
      }

      const threadId = await this.chatService.getNutriReportThreadId(userId);

      await this.queueService
        .getQueue(Queues.TELEGRAM)
        .add(JobType.PROCESS_MEAL_TEXT_REPORT, {
          text,
          telegramId,
          threadId
        });
    });

    this.scene.on(message('voice'), async (ctx) => {
      const telegramId = getTelegramUserId(ctx);
      const fileId = getVoiceFileId(ctx);

      const userId = await this.userService.getUserIdByTelegramId(telegramId);
      const threadId = await this.chatService.getNutriReportThreadId(userId);

      await this.queueService
        .getQueue(Queues.TELEGRAM)
        .add(JobType.PROCESS_MEAL_AUDIO_REPORT, {
          fileId,
          threadId,
          telegramId
        });
    });

    this.scene.on('callback_query', async (ctx) => {
      try {
        const telegramId = getTelegramUserId(ctx);
        const cbData = getCallbackData(ctx);

        switch (cbData) {
          case inputCbData: {
            const text = getTextFromCallback(ctx);

            await this.queueService
              .getQueue(Queues.TELEGRAM)
              .add(JobType.PROCESS_MEAL_TEXT_REPORT_TO_JSON, {
                text,
                telegramId
              });
            break;
          }
          default:
        }
      } catch (e) {
        console.log('error');
      }
    });
  }
}

// FIXME:
const inputCbData = 'input';
