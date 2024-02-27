import { IContext } from 'common/telegram/context/context.interface';
import { inject, injectable } from 'inversify';
import { Markup, Telegraf } from 'telegraf';
import { ChatAction } from 'telegraf/typings/core/types/typegram';
import { FmtString } from 'telegraf/typings/format';
import { ExtraReplyMessage } from 'telegraf/typings/telegram-types';
import { TYPES } from 'types';
import { IConfigService } from 'utils/config/config.interface';
import { ILoggerService } from 'utils/logger/logger.interface';

// FIXME:
const inputCbData = 'input';

@injectable()
export class TelegramService {
  public bot: Telegraf<IContext>;

  constructor(
    @inject(TYPES.ILoggerService)
    private readonly logger: ILoggerService,
    @inject(TYPES.IConfigService)
    private readonly config: IConfigService
  ) {
    this.bot = new Telegraf<IContext>(this.config.get('TELEGRAM_TOKEN'));
  }

  public async sendMessage(
    chatId: number | string,
    text: string | FmtString,
    extra?: ExtraReplyMessage
  ) {
    return this.bot.telegram.sendMessage(chatId, text, extra);
  }

  public async sendAction(chatId: number | string, action: ChatAction) {
    return this.bot.telegram.sendChatAction(chatId, action);
  }

  public async sendMealReportResult(chatId: number | string, text: string) {
    return this.sendMessage(
      chatId,
      text,
      Markup.inlineKeyboard([
        [
          {
            // FIXME:
            text: 'Внести эти данные в мой дневник',
            callback_data: inputCbData
          }
        ]
      ])
    );
  }
}
