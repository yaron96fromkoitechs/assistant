import { inject, injectable } from 'inversify';
import { Markup, Scenes } from 'telegraf';

import { IGptService } from 'utils/gpt/gpt.interface';
import { IUserService } from 'entities/user/user.service.interface';

import { BaseSceneHandler } from 'common/telegram/handlers/handler.class';
import { IBaseSceneContext } from 'common/telegram/context/context.interface';
import { message } from 'telegraf/filters';
import { BaseScene } from 'telegraf/typings/scenes';

import { SCENES } from 'common/telegram/scenes.types';
import {
  getCallbackData,
  getTextFromCallback,
  getUserId
} from 'common/telegram/helpers';
import { JobType, QueueService, Queues } from 'utils/queue/queue.service';

import { TYPES } from 'types';

@injectable()
export class ChatSceneHandler extends BaseSceneHandler {
  sceneId: string;
  scene: BaseScene<IBaseSceneContext>;

  constructor(
    @inject(TYPES.IGptService) private readonly gptService: IGptService,
    @inject(TYPES.IUserService) private readonly userService: IUserService,
    @inject(TYPES.QueueService) private readonly queueService: QueueService
  ) {
    super();
    this.sceneId = SCENES.CHAT;
    this.scene = new Scenes.BaseScene<IBaseSceneContext>(this.sceneId);
  }

  handle(): void {
    this.scene.enter(async (ctx) => {
      const userId = getUserId(ctx);

      // FIXME:
      if (!ctx.session.nutriReportThreadId) {
        const threadId = await this.gptService.createThread();
        ctx.session.nutriReportThreadId = threadId;
      }

      const user = await this.userService.getUserByTelegram(userId);
      if (!user) {
        await this.userService.createUserByTelegram(userId);
      }

      ctx.sendMessage(
        ctx.i18n.t('telegram.chat.enter'),
        Markup.keyboard([
          [ctx.i18n.t('telegram.buttons.meals')],
          [ctx.i18n.t('telegram.buttons.settings')]
        ]).resize()
      );
    });

    this.scene.on(message('text'), async (ctx) => {
      const {
        from: { id: telegramId },
        message: { text },
        session: { nutriReportThreadId: threadId }
      } = ctx;

      if (text === ctx.i18n.t('telegram.buttons.settings')) {
        return ctx.scene.enter(SCENES.SETTINGS);
      } else if (text === ctx.i18n.t('telegram.buttons.meals')) {
        return ctx.scene.enter(SCENES.MEALS);
      }

      await this.queueService
        .getQueue(Queues.TELEGRAM)
        .add(JobType.PROCESS_MEAL_TEXT_REPORT, {
          text,
          telegramId,
          threadId
        });
    });

    this.scene.on(message('voice'), async (ctx) => {
      const {
        session: { nutriReportThreadId },
        update: {
          message: {
            voice: { file_id }
          }
        }
      } = ctx;

      await this.queueService
        .getQueue(Queues.TELEGRAM)
        .add(JobType.PROCESS_MEAL_AUDIO_REPORT, {
          fileId: file_id,
          threadId: nutriReportThreadId,
          telegramId: ctx.from.id
        });
    });

    this.scene.on('callback_query', async (ctx) => {
      try {
        const userId = getUserId(ctx);

        const cbData = getCallbackData(ctx);

        switch (cbData) {
          case inputCbData: {
            const text = getTextFromCallback(ctx);

            await this.queueService
              .getQueue(Queues.TELEGRAM)
              .add(JobType.PROCESS_MEAL_TEXT_REPORT_TO_JSON, {
                text,
                // FIXME:
                telegramId: userId
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
