import { inject, injectable } from 'inversify';
import { Markup, Scenes } from 'telegraf';

//FIXME:
import { MealModel } from '@prisma/client';

import { IUserService } from 'entities/user/user.service.interface';
import { IMealService } from './user.meal.service.interface';

import { BaseSceneHandler } from 'common/telegram/handlers/handler.class';
import { IBaseSceneContext } from 'common/telegram/context/context.interface';
import { message } from 'telegraf/filters';
import { BaseScene } from 'telegraf/typings/scenes';

import { SCENES } from 'common/telegram/scenes.types';

import { TYPES } from 'types';
import {
  getCallbackData,
  getMessageText,
  getUserId
} from 'common/telegram/helpers';

@injectable()
export class MealsSceneHandler extends BaseSceneHandler {
  sceneId: string;
  scene: BaseScene<IBaseSceneContext>;

  constructor(
    @inject(TYPES.IUserService) private readonly userService: IUserService,
    @inject(TYPES.IMealService) private readonly mealService: IMealService
  ) {
    super();
    this.sceneId = SCENES.MEALS;
    this.scene = new Scenes.BaseScene<IBaseSceneContext>(this.sceneId);
  }

  handle(): void {
    this.scene.enter(async (ctx) => {
      const id = getUserId(ctx);
      const { text, keyboard } = await this.pagination(id, 1);
      await ctx.sendMessage(
        'Welcome bla-bla',
        Markup.keyboard([
          [ctx.i18n.t('telegram.buttons.chat')],
          [ctx.i18n.t('telegram.buttons.settings')]
        ]).resize()
      );
      await ctx.sendMessage(text, keyboard);
    });

    this.scene.on(message('text'), async (ctx) => {
      const text = getMessageText(ctx);
      if (text === ctx.i18n.t('telegram.buttons.settings')) {
        return ctx.scene.enter(SCENES.SETTINGS);
      } else if (text === ctx.i18n.t('telegram.buttons.chat')) {
        return ctx.scene.enter(SCENES.CHAT);
      }
    });

    this.scene.on('callback_query', async (ctx) => {
      try {
        const id = getUserId(ctx);
        const cbData = getCallbackData(ctx);

        if (!cbData.startsWith(this.sceneId)) {
          return;
        }

        const { text, keyboard } = await this.pagination(
          id,
          Number(cbData.split(':')[1])
        );
        ctx.editMessageText(text, keyboard);
      } catch (e) {
        //
      }
    });
  }

  private async pagination(userId: number, page: number) {
    const user = await this.userService.getUserByTelegram(userId);

    const limit = 5;

    const { meals, count } = await this.mealService.getMealsList({
      userId: user.id,
      limit,
      page
    });

    function mealsToMessage(meals: MealModel[]) {
      return meals
        .map((meal) => {
          const { createdAt, calories, fat, protein, carbohydrate } = meal;
          return `🗓${createdAt.toISOString()} 
            ⚡️ Calories: ${calories},
            🔥Fat: ${fat},
            ⛓Protein: ${protein},
            🍚Carbohydrate: ${carbohydrate}`;
        })
        .join('\n\n');
    }

    return {
      text: mealsToMessage(meals),
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
  }
}
