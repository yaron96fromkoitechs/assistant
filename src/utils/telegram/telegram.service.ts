import { IContext } from 'common/telegram/context/context.interface';
import { UserService } from 'entities/user/user.service';
import { inject, injectable } from 'inversify';
import { Markup, Telegraf } from 'telegraf';
import { ChatAction } from 'telegraf/typings/core/types/typegram';
import { FmtString } from 'telegraf/typings/format';
import { ExtraReplyMessage } from 'telegraf/typings/telegram-types';
import { TYPES } from 'types';
import { IConfigService } from 'utils/config/config.interface';
import { LocaleService } from 'utils/locale/locale.service';

// FIXME:
const inputCbData = 'input';

@injectable()
export class TelegramService {
  public bot: Telegraf<IContext>;

  constructor(
    @inject(TYPES.IConfigService)
    private readonly configService: IConfigService,
    @inject(TYPES.IUserService) private readonly userService: UserService,
    @inject(TYPES.LocaleService) private readonly localeService: LocaleService
  ) {
    this.bot = new Telegraf<IContext>(this.configService.get('TELEGRAM_TOKEN'));
  }

  public async sendMessage(
    chatId: number | string,
    text: string | FmtString,
    extra?: ExtraReplyMessage
  ) {
    return this.bot.telegram.sendMessage(chatId, text, extra);
  }

  public async sendAction(telegramId: number | string, action: ChatAction) {
    return this.bot.telegram.sendChatAction(telegramId, action);
  }

  public async sendMealReportResult(telegramId: number, text: string) {
    const userId = await this.userService.getUserIdByTelegramId(telegramId);
    const locale = await this.userService.getLocale(userId);

    return this.sendMessage(
      telegramId,
      text,
      Markup.inlineKeyboard([
        [
          {
            text: this.localeService.t('telegram.chat.add-to-dairy', locale),
            callback_data: inputCbData
          }
        ]
      ])
    );
  }
}
