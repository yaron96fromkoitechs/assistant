import { injectable } from 'inversify';
import { Markup, Scenes } from 'telegraf';

import { WizardScene } from 'telegraf/typings/scenes';
import { IWizardSceneContext } from 'common/telegram/context/context.interface';
import { Scene } from 'common/telegram/handlers/handler.class';

import { getCallbackData, getMessageText } from 'common/telegram/helpers';

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

      async function step0(ctx) {
        await askLang(ctx);
        ctx.wizard.next();
      },

      async function step1(ctx) {
        try {
          const cbData = getCallbackData(ctx);

          if (!cbData) {
            throw new Error('error');
          }

          const langCodes = Object.keys(ctx.i18n.repository);

          if (!langCodes.includes(cbData)) {
            throw new Error('error');
          }

          ctx.i18n.locale(cbData);
          await askName(ctx);
          ctx.wizard.next();
        } catch (e) {
          ctx.reply(e.message);
          return askLang(ctx);
        }
      },

      async function step2(ctx) {
        try {
          const text = getMessageText(ctx);

          if (!text) {
            throw new Error('error');
          }

          ctx.session.name = text;
          await askGender(ctx);
          ctx.wizard.next();
        } catch (e) {
          ctx.reply(e.message);
          return askName(ctx);
        }
      },

      async function step3(ctx) {
        try {
          const cbData = getCallbackData(ctx);

          if (!cbData) {
            throw new Error('error');
          }

          switch (cbData) {
            case 'male':
            case 'female': {
              ctx.session.gender = cbData;
              await askAge(ctx);
              ctx.wizard.next();
            }
          }
        } catch (e) {
          ctx.reply(e.message);
          return askGender(ctx);
        }
      },

      async function step5(ctx) {
        try {
          let age: any = getMessageText(ctx);

          if (!age) {
            throw new Error('error');
          }

          age = Number(age);

          if (isNaN(age)) {
            throw new Error('error');
          }

          ctx.session.age = age;
          await askMeasurementSystem(ctx);
          ctx.wizard.next();
        } catch (e) {
          ctx.reply(e.message);
          return askAge(ctx);
        }
      },

      async function step5(ctx) {
        try {
          const cbData = getCallbackData(ctx);

          if (!cbData) {
            throw new Error('error');
          }

          switch (cbData) {
            case 'metric':
            case 'imperial': {
              ctx.session.measureSystem = cbData;
              await askHeight(ctx);
              ctx.wizard.next();
              break;
            }
            default: {
              throw new Error('error');
            }
          }
        } catch (e) {
          ctx.reply(e.message);
          return askMeasurementSystem(ctx);
        }
      },

      async function step6(ctx) {
        try {
          let height: any = getMessageText(ctx);

          if (!height) {
            throw new Error('error');
          }

          height = Number(height);

          if (isNaN(height)) {
            throw new Error('error');
          }

          ctx.session.height = height;
          await askWeight(ctx);
          ctx.wizard.next();
        } catch (e) {
          ctx.reply(e.message);
          return askHeight(ctx);
        }
      },

      async function step7(ctx) {
        try {
          let weight: any = getMessageText(ctx);

          if (!weight) {
            throw new Error('error');
          }

          weight = Number(weight);

          if (isNaN(weight)) {
            throw new Error('error');
          }

          ctx.session.weight = weight;
          await askGoal(ctx);
          ctx.wizard.next();
        } catch (e) {
          ctx.reply('error');
          return askWeight(ctx);
        }
      },

      async function step8(ctx) {
        try {
          const cbData = getCallbackData(ctx);

          if (!cbData) {
            throw new Error('error');
          }

          switch (cbData) {
            case 'gain':
            case 'keep':
            case 'lose': {
              ctx.session.goal = cbData;
              break;
            }
            default: {
              throw new Error('error');
            }
          }

          ctx.reply(aboutMessage(ctx));
          ctx.scene.enter(SCENES.CHAT);
        } catch (e) {
          ctx.reply('error');
          return askGoal(ctx);
        }
      }
    );
  }
}

const aboutMessage = (ctx: IWizardSceneContext): string => {
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
    ctx.session.weight
      ? `${ctx.i18n.t('core.about.weight')}: ${ctx.session.weight} ${ctx.i18n.t(
          `core.measure_system.${ctx.session.measureSystem}.weight_short`
        )}`
      : '',
    ctx.session.height
      ? `${ctx.i18n.t('core.about.height')}: ${ctx.session.height} ${ctx.i18n.t(
          `core.measure_system.${ctx.session.measureSystem}.height_short`
        )}`
      : '',
    ctx.session.goal
      ? `${ctx.i18n.t('core.about.goal')}: ${ctx.i18n.t(
          `core.goals.${ctx.session.goal}`
        )}`
      : ''
  ];
  return result.join('\n');
};

const askLang = async (ctx: IWizardSceneContext) => {
  const langCodes = Object.keys(ctx.i18n.repository);

  return ctx.reply(
    ctx.i18n.t('telegram.settings.choose_lang'),
    Markup.inlineKeyboard([
      ...langCodes.map((langCode) => [
        Markup.button.callback(langCode.toLocaleUpperCase(), langCode)
      ])
    ])
  );
};

const askName = async (ctx: IWizardSceneContext) => {
  return ctx.reply(ctx.i18n.t('telegram.settings.enter_name'));
};

const askAge = async (ctx: IWizardSceneContext) => {
  return ctx.reply(ctx.i18n.t('telegram.settings.enter_age'));
};

const askGender = async (ctx: IWizardSceneContext) => {
  return ctx.reply(
    ctx.i18n.t('telegram.settings.select_gender'),
    Markup.inlineKeyboard([
      [Markup.button.callback(`${ctx.i18n.t('core.genders.male')}`, `male`)],
      [Markup.button.callback(`${ctx.i18n.t('core.genders.female')}`, `female`)]
    ])
  );
};

const askMeasurementSystem = async (ctx: IWizardSceneContext) => {
  return ctx.reply(
    ctx.i18n.t('telegram.settings.select_measure'),
    Markup.inlineKeyboard([
      [
        Markup.button.callback(
          `${ctx.i18n.t('core.measure_system.metric.title')}`,
          `metric`
        )
      ],
      [
        Markup.button.callback(
          `${ctx.i18n.t('core.measure_system.imperial.title')}`,
          `imperial`
        )
      ]
    ])
  );
};

const askHeight = async (ctx: IWizardSceneContext) => {
  const measure = ctx.session.measureSystem;
  const heightUnit = ctx.i18n.t(`core.measure_system.${measure}.height`);
  const message = `${ctx.i18n.t(
    'telegram.settings.enter_height'
  )} (${heightUnit})`;

  return ctx.reply(message);
};

const askWeight = async (ctx: IWizardSceneContext) => {
  const measure = ctx.session.measureSystem;
  const heightUnit = ctx.i18n.t(`core.measure_system.${measure}.weight`);
  const message = `${ctx.i18n.t(
    'telegram.settings.enter_weight'
  )} (${heightUnit})`;

  return ctx.reply(message);
};

const askGoal = async (ctx: IWizardSceneContext) => {
  return ctx.reply(
    `${ctx.i18n.t('telegram.settings.select_goal')}:\n`,
    Markup.inlineKeyboard([
      [Markup.button.callback(`${ctx.i18n.t('core.goals.lose')}`, `lose`)],
      [Markup.button.callback(`${ctx.i18n.t('core.goals.keep')}`, `keep`)],
      [Markup.button.callback(`${ctx.i18n.t('core.goals.gain')}`, `gain`)]
    ])
  );
};
