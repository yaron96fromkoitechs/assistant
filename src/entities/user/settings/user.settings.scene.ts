import { injectable } from 'inversify';
import { Markup, Scenes } from 'telegraf';
import { IContext } from 'common/telegram/context/context.interface';

import { WizardScene } from 'telegraf/typings/scenes';
import { IWizardSceneContext } from 'common/telegram/context/context.interface';
import { Scene } from 'common/telegram/handlers/handler.class';

import { SCENES } from 'common/telegram/scenes.types';

@injectable()
export class UserSettingsSceneHandler extends Scene {
  sceneId: string;
  scene: WizardScene<IWizardSceneContext>;

  constructor() {
    super();
    this.sceneId = SCENES.SETTINGS;

    this.scene = new Scenes.WizardScene<IWizardSceneContext>(
      this.sceneId,

      async (ctx) => {
        const langCodes = Object.keys(ctx.i18n.repository);
        ctx.reply(
          ctx.i18n.t('telegram.settings.choose_lang'),
          Markup.inlineKeyboard([
            ...langCodes.map((langCode) => [
              Markup.button.callback(langCode.toLocaleUpperCase(), langCode)
            ])
          ])
        );
        ctx.wizard.next();
      },

      async (ctx) => {
        if (
          ctx.update &&
          'callback_query' in ctx.update &&
          'data' in ctx.update.callback_query
        ) {
          const langCodes = Object.keys(ctx.i18n.repository);
          if (langCodes.includes(ctx.update.callback_query.data)) {
            console.log('includes');
            ctx.i18n.locale(ctx.update.callback_query.data);
            ctx.reply(ctx.i18n.t('telegram.settings.enter_name'));
            ctx.wizard.next();
          }
        }
      },

      async (ctx) => {
        if (ctx.message && 'text' in ctx.message) {
          ctx.session.name = ctx.message.text;
          ctx.reply(ctx.i18n.t('telegram.settings.enter_age'));
          ctx.wizard.next();
        }
      },

      async (ctx) => {
        if (ctx.message && 'text' in ctx.message) {
          const age = Number(ctx.message.text);
          if (isNaN(age)) {
            return ctx.reply('error');
          }
          ctx.session.age = age;
          ctx.reply(
            `${ctx.i18n.t('telegram.settings.select_goal')}:\n`,
            Markup.inlineKeyboard([
              [
                Markup.button.callback(
                  `${ctx.i18n.t('core.goals.lose')}`,
                  `lose`
                )
              ],
              [
                Markup.button.callback(
                  `${ctx.i18n.t('core.goals.keep')}`,
                  `keep`
                )
              ],
              [
                Markup.button.callback(
                  `${ctx.i18n.t('core.goals.gain')}`,
                  `gain`
                )
              ]
            ])
          );
          ctx.wizard.next();
        }
      },

      async (ctx) => {
        if (
          ctx.update &&
          'callback_query' in ctx.update &&
          'data' in ctx.update.callback_query
        ) {
          switch (ctx.update.callback_query.data) {
            case 'gain':
            case 'keep':
            case 'lose': {
              ctx.session.goal = ctx.update.callback_query.data;
            }
          }
          await ctx.editMessageText(aboutMessage(ctx));
          await ctx.editMessageReplyMarkup({ inline_keyboard: [] });
          ctx.scene.enter(SCENES.CHAT);
        }
      }
    );
  }
}

const aboutMessage = (ctx: IContext): string => {
  const result = [
    ctx.session.name
      ? `${ctx.i18n.t('core.about.name')}: ${ctx.session.name}`
      : '',
    ctx.session.gender
      ? `${ctx.i18n.t('core.about.gender')}: ${ctx.i18n.t(
          `core.genders.${ctx.session.gender}`
        )}`
      : '',
    ctx.session.age
      ? `${ctx.i18n.t('core.about.age')}: ${ctx.session.age}`
      : '',
    ctx.session.goal
      ? `${ctx.i18n.t('core.about.goal')}: ${ctx.i18n.t(
          `core.goals.${ctx.session.goal}`
        )}`
      : ''
  ];
  return result.join('\n');
};
