import { inject, injectable } from 'inversify';

import { Markup, Scenes } from 'telegraf';
import { message } from 'telegraf/filters';
import { BaseScene } from 'telegraf/typings/scenes';

import { IMealService } from './user.meal.service.interface';
import { IUserService } from 'entities/user/user.service.interface';
import { LocaleService } from 'utils/locale/locale.service';

import { BaseSceneHandler } from 'common/telegram/handlers/handler.class';
import { IBaseSceneContext } from 'common/telegram/context/context.interface';
import {
  getCallbackData,
  getMessageText,
  getTelegramUserId
} from 'common/telegram/helpers';

import { SCENES } from 'common/telegram/scenes.types';
import { TYPES } from 'types';

@injectable()
export class MealsSceneHandler extends BaseSceneHandler {
  sceneId: string;
  scene: BaseScene<IBaseSceneContext>;

  constructor(
    @inject(TYPES.IUserService) private readonly userService: IUserService,
    @inject(TYPES.IMealService) private readonly mealService: IMealService,
    @inject(TYPES.LocaleService) private readonly localeService: LocaleService
  ) {
    super();
    this.sceneId = SCENES.MEALS;
    this.scene = new Scenes.BaseScene<IBaseSceneContext>(this.sceneId);
  }

  handle(): void {
    this.scene.enter(async (ctx) => {
      const telegramId = getTelegramUserId(ctx);
      const userId = await this.userService.getUserIdByTelegramId(telegramId);
      const locale = await this.userService.getLocale(userId);

      await ctx.sendMessage(
        this.localeService.t('telegram.meals.on-enter', locale),
        Markup.keyboard([
          [this.localeService.t('telegram.buttons.chat', locale)],
          [this.localeService.t('telegram.buttons.settings', locale)]
        ]).resize()
      );

      const { text, keyboard } = await this.pagination(userId, 1, locale);

      await ctx.sendMessage(text, keyboard);
    });

    this.scene.on(message('text'), async (ctx) => {
      const telegramId = getTelegramUserId(ctx);
      const userId = await this.userService.getUserIdByTelegramId(telegramId);
      const locale = await this.userService.getLocale(userId);

      const text = getMessageText(ctx);

      if (text === this.localeService.t('telegram.buttons.settings', locale)) {
        return ctx.scene.enter(SCENES.SETTINGS);
      } else if (
        text === this.localeService.t('telegram.buttons.chat', locale)
      ) {
        return ctx.scene.enter(SCENES.CHAT);
      }
    });

    this.scene.on('callback_query', async (ctx) => {
      try {
        const telegramId = getTelegramUserId(ctx);
        const userId = await this.userService.getUserIdByTelegramId(telegramId);
        const locale = await this.userService.getLocale(userId);
        const cbData = getCallbackData(ctx);

        if (!cbData.startsWith(this.sceneId)) {
          return;
        }

        const { text, keyboard } = await this.pagination(
          userId,
          Number(cbData.split(':')[1]),
          locale
        );
        ctx.editMessageText(text, keyboard);
      } catch (e) {
        //
      }
    });
  }

  private async pagination(userId: number, page: number, locale: string) {
    try {
      const limit = 5;

      const { meals, count } = await this.mealService.getMealsList({
        userId,
        limit,
        page
      });

      if (!meals.length) {
        return {
          text: this.localeService.t('telegram.meals.no-meals', locale),
          keyboard: Markup.inlineKeyboard([])
        };
      }

      const text = meals
        .map((meal) => {
          const { createdAt, calories, fats, proteins, carbohydrates } = meal;
          return `🗓${createdAt.toISOString()} 
          ⚡️${this.localeService.t(
            'core.macronutrients.calories',
            locale
          )}: ${calories},
          🔥${this.localeService.t(
            'core.macronutrients.fats',
            locale
          )}: ${fats},
          ⛓${this.localeService.t(
            'core.macronutrients.proteins',
            locale
          )}: ${proteins},
          🍚${this.localeService.t(
            'core.macronutrients.carbohydrates',
            locale
          )}: ${carbohydrates}`;
        })
        .join('\n\n');

      return {
        text,
        keyboard: Markup.inlineKeyboard([
          [
            ...(page > 1
              ? [{ text: '<', callback_data: `${this.sceneId}:${page - 1}` }]
              : []),
            ...(page + 1 <= Math.ceil(count / limit)
              ? [{ text: '>', callback_data: `${this.sceneId}:${page + 1}` }]
              : [])
          ]
        ])
      };
    } catch (error) {
      console.log(error);
    }
  }
}
