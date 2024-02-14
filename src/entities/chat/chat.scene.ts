import axios from 'axios';
import { inject, injectable } from 'inversify';
import { Markup, Scenes } from 'telegraf';

import { IFileService } from 'utils/file/file.interface';
import { IGptService } from 'utils/gpt/gpt.interface';
import { BaseSceneHandler } from 'common/telegram/handlers/handler.class';
import { IContext } from 'common/telegram/context/context.interface';
import { message } from 'telegraf/filters';
import { BaseScene } from 'telegraf/typings/scenes';

import { SCENES } from 'common/telegram/scenes.types';
import { TYPES } from 'types';

@injectable()
export class ChatSceneHandler extends BaseSceneHandler {
  sceneId: string;
  scene: BaseScene<IContext>;

  constructor(
    @inject(TYPES.IFileService) private readonly fileService: IFileService,
    @inject(TYPES.IGptService) private readonly gptService: IGptService
  ) {
    super();
    this.sceneId = SCENES.CHAT;
    this.scene = new Scenes.BaseScene<IContext>(this.sceneId);
  }

  handle(): void {
    this.scene.enter(async (ctx) => {
      if (!ctx.session.threadId) {
        const threadId = await this.gptService.createThread();
        ctx.session.threadId = threadId;
      }
      ctx.sendMessage(
        ctx.i18n.t('telegram.chat.enter'),
        Markup.keyboard([[ctx.i18n.t('telegram.buttons.settings')]]).resize()
      );
    });

    this.scene.on(message('text'), async (ctx) => {
      if (ctx.message.text === ctx.i18n.t('telegram.buttons.settings')) {
        return ctx.scene.enter(SCENES.SETTINGS);
      }

      ctx.sendChatAction('typing');

      const response = await this.gptService.sendMessageAndGetResponse(
        ctx.session.threadId,
        ctx.message.text
      );

      if ('text' in response.content[0]) {
        ctx.sendMessage(response.content[0].text.value);
      }
    });

    this.scene.on(message('voice'), async (ctx) => {
      const {
        session: { threadId },
        update: {
          message: {
            voice: { file_id }
          }
        }
      } = ctx;

      ctx.sendChatAction('typing');

      const link = await ctx.telegram.getFileLink(file_id);
      const res = await axios(link.href, { responseType: 'arraybuffer' });
      const filename = `${new Date().getTime()}.oga`;
      const path = await this.fileService.saveBufferToFile(filename, res.data);
      const text = await this.gptService.audioToTextTranscription(path);
      await this.fileService.removeFile(filename);

      const { content } = await this.gptService.sendMessageAndGetResponse(
        threadId,
        text
      );

      if ('text' in content[0]) {
        ctx.sendMessage(content[0].text.value);
      }
    });
  }
}
