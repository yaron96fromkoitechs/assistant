import { Telegraf } from 'telegraf';

import { Handler } from 'common/telegram/handlers/handler.class';
import { IContext } from 'common/telegram/context/context.interface';

import { SCENES } from 'common/telegram/scenes.types';

export class StartCommandHandler extends Handler {
  constructor(bot: Telegraf<IContext>) {
    super(bot);
  }

  handle(): void {
    this.bot.start((ctx) => {
      ctx.scene.enter(SCENES.SETTINGS);
    });
  }
}
