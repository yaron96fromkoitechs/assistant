import { inject, injectable } from 'inversify';
import { Markup, Scenes } from 'telegraf';
import { WizardScene } from 'telegraf/typings/scenes';

import { IWizardSceneContext } from 'common/telegram/context/context.interface';
import { Scene } from 'common/telegram/handlers/handler.class';

import {
  getCallbackData,
  getMessageText,
  getTelegramUserId
} from 'common/telegram/helpers';

import { SCENES } from 'common/telegram/scenes.types';
import { TYPES } from 'types';
import { LocaleService } from 'utils/locale/locale.service';
import { UserBioService } from './user.bio.service';
import { IUserService } from '../user.service.interface';

@injectable()
export class UserSettingsSceneHandler extends Scene {
  sceneId: string;
  scene: WizardScene<IWizardSceneContext>;

  constructor(
    @inject(TYPES.LocaleService) private readonly localeService: LocaleService,
    @inject(TYPES.UserBioService)
    private readonly userBioService: UserBioService,
    @inject(TYPES.IUserService) private readonly userService: IUserService
  ) {
    super();
    this.sceneId = SCENES.SETTINGS;

    this.scene = new Scenes.WizardScene<IWizardSceneContext>(
      this.sceneId,

      async (ctx) => {
        await this.askLang(ctx);
        ctx.wizard.next();
      },

      async (ctx) => {
        try {
          const cbData = getCallbackData(ctx);

          if (!cbData) {
            throw new Error('error');
          }

          const langCodes = this.localeService.getAvailableLangs();

          if (!langCodes.includes(cbData)) {
            throw new Error('error');
          }

          const telegramId = getTelegramUserId(ctx);
          const userId =
            await this.userService.getUserIdByTelegramId(telegramId);

          await this.userBioService.setLocale(userId, cbData);
          await this.askName(ctx);
          ctx.wizard.next();
        } catch (e) {
          ctx.reply(e.message);
          return this.askLang(ctx);
        }
      },

      async (ctx) => {
        try {
          const text = getMessageText(ctx);

          if (!text) {
            throw new Error('error');
          }

          const telegramId = getTelegramUserId(ctx);
          const userId =
            await this.userService.getUserIdByTelegramId(telegramId);
          await this.userBioService.setName(userId, text);
          await this.askGender(ctx);
          ctx.wizard.next();
        } catch (e) {
          ctx.reply(e.message);
          return this.askName(ctx);
        }
      },

      async (ctx) => {
        try {
          const cbData = getCallbackData(ctx);

          if (!cbData) {
            throw new Error('error');
          }

          const telegramId = getTelegramUserId(ctx);
          const userId =
            await this.userService.getUserIdByTelegramId(telegramId);

          switch (cbData) {
            case 'neutral':
            case 'male':
            case 'female': {
              this.userBioService.setGender(userId, cbData);
              await this.askAge(ctx);
              ctx.wizard.next();
            }
          }
        } catch (e) {
          ctx.reply(e.message);
          return this.askGender(ctx);
        }
      },

      async (ctx) => {
        try {
          let age: any = getMessageText(ctx);
          if (!age) {
            throw new Error('error');
          }

          age = Number(age);

          if (isNaN(age)) {
            throw new Error('error');
          }

          const telegramId = getTelegramUserId(ctx);
          const userId =
            await this.userService.getUserIdByTelegramId(telegramId);
          await this.userBioService.setAge(userId, age);

          await this.askMeasurementSystem(ctx);
          ctx.wizard.next();
        } catch (e) {
          ctx.reply(e.message);
          return this.askAge(ctx);
        }
      },

      async (ctx) => {
        try {
          const cbData = getCallbackData(ctx);

          if (!cbData) {
            throw new Error('error');
          }

          switch (cbData) {
            case 'metric':
            case 'imperial': {
              const telegramId = getTelegramUserId(ctx);
              const userId =
                await this.userService.getUserIdByTelegramId(telegramId);

              this.userBioService.setMeasurementSystem(userId, cbData);
              await this.askHeight(ctx);
              ctx.wizard.next();
              break;
            }
            default: {
              throw new Error('error');
            }
          }
        } catch (e) {
          ctx.reply(e.message);
          return this.askMeasurementSystem(ctx);
        }
      },

      async (ctx) => {
        try {
          let height: any = getMessageText(ctx);

          if (!height) {
            throw new Error('error');
          }

          height = Number(height);

          if (isNaN(height)) {
            throw new Error('error');
          }

          const telegramId = getTelegramUserId(ctx);
          const userId =
            await this.userService.getUserIdByTelegramId(telegramId);
          await this.userBioService.setHeight(userId, height);

          await this.askWeight(ctx);
          ctx.wizard.next();
        } catch (e) {
          ctx.reply(e.message);
          return this.askHeight(ctx);
        }
      },

      async (ctx) => {
        try {
          let weight: any = getMessageText(ctx);

          if (!weight) {
            throw new Error('error');
          }

          weight = Number(weight);

          if (isNaN(weight)) {
            throw new Error('error');
          }

          const telegramId = getTelegramUserId(ctx);
          const userId =
            await this.userService.getUserIdByTelegramId(telegramId);
          await this.userBioService.setWeight(userId, weight);

          await this.askGoal(ctx);
          ctx.wizard.next();
        } catch (e) {
          ctx.reply('error');
          return this.askWeight(ctx);
        }
      },

      async (ctx) => {
        try {
          const cbData = getCallbackData(ctx);

          if (!cbData) {
            throw new Error('error');
          }

          switch (cbData) {
            case 'gain':
            case 'keep':
            case 'lose': {
              const telegramId = getTelegramUserId(ctx);
              const userId =
                await this.userService.getUserIdByTelegramId(telegramId);
              await this.userBioService.setGoal(userId, cbData);
              break;
            }
            default: {
              throw new Error('error');
            }
          }

          await this.aboutMessage(ctx);
          ctx.scene.enter(SCENES.CHAT);
        } catch (e) {
          ctx.reply('error');
          return this.askGoal(ctx);
        }
      }
    );
  }

  private async askLang(ctx: IWizardSceneContext) {
    const langCodes = this.localeService.getAvailableLangs();

    const msg = langCodes
      .map((code) => {
        return this.localeService.t('telegram.bio.choose_lang', code);
      })
      .join('\n');

    return ctx.reply(
      msg,
      Markup.inlineKeyboard([
        ...langCodes.map((langCode) => [
          Markup.button.callback(langCode.toLocaleUpperCase(), langCode)
        ])
      ])
    );
  }

  private async askName(ctx: IWizardSceneContext) {
    const telegramId = getTelegramUserId(ctx);
    const userId = await this.userService.getUserIdByTelegramId(telegramId);
    const locale = await this.userBioService.getLocale(userId);
    const msg = this.localeService.t('telegram.bio.enter_name', locale);
    return ctx.reply(msg);
  }

  private async askGender(ctx: IWizardSceneContext) {
    const telegramId = getTelegramUserId(ctx);
    const userId = await this.userService.getUserIdByTelegramId(telegramId);
    const locale = await this.userBioService.getLocale(userId);
    const msg = this.localeService.t('telegram.bio.select_gender', locale);
    return ctx.reply(
      msg,
      Markup.inlineKeyboard([
        [
          Markup.button.callback(
            `${this.localeService.t('core.genders.male', locale)}`,
            `male`
          )
        ],
        [
          Markup.button.callback(
            `${this.localeService.t('core.genders.female', locale)}`,
            `female`
          )
        ]
      ])
    );
  }

  private async askAge(ctx: IWizardSceneContext) {
    const telegramId = getTelegramUserId(ctx);
    const userId = await this.userService.getUserIdByTelegramId(telegramId);
    const locale = await this.userBioService.getLocale(userId);
    const msg = this.localeService.t('telegram.bio.enter_age', locale);

    return ctx.reply(msg);
  }

  private async askMeasurementSystem(ctx: IWizardSceneContext) {
    const telegramId = getTelegramUserId(ctx);
    const userId = await this.userService.getUserIdByTelegramId(telegramId);
    const locale = await this.userBioService.getLocale(userId);
    const msg = this.localeService.t('telegram.bio.select_measure', locale);

    return ctx.reply(
      msg,
      Markup.inlineKeyboard([
        [
          Markup.button.callback(
            this.localeService.t('core.measure_system.metric.title', locale),
            `metric`
          )
        ],
        [
          Markup.button.callback(
            this.localeService.t('core.measure_system.imperial.title', locale),
            `imperial`
          )
        ]
      ])
    );
  }

  private async askHeight(ctx: IWizardSceneContext) {
    const telegramId = getTelegramUserId(ctx);
    const userId = await this.userService.getUserIdByTelegramId(telegramId);
    const measure = await this.userBioService.getMeasurementSystem(userId);
    const locale = await this.userBioService.getLocale(userId);

    const heightUnit = this.localeService.t(
      `core.measure_system.${measure}.height`,
      locale
    );

    const msg = `${this.localeService.t(
      'telegram.bio.enter_height',
      locale
    )} (${heightUnit})`;

    return ctx.reply(msg);
  }

  private async askWeight(ctx: IWizardSceneContext) {
    const telegramId = getTelegramUserId(ctx);
    const userId = await this.userService.getUserIdByTelegramId(telegramId);
    const measure = await this.userBioService.getMeasurementSystem(userId);
    const locale = await this.userBioService.getLocale(userId);

    const weightUnit = this.localeService.t(
      `core.measure_system.${measure}.weight`,
      locale
    );

    const msg = `${this.localeService.t(
      'telegram.bio.enter_weight',
      locale
    )} (${weightUnit})`;

    return ctx.reply(msg);
  }

  private async askGoal(ctx: IWizardSceneContext) {
    const telegramId = getTelegramUserId(ctx);
    const userId = await this.userService.getUserIdByTelegramId(telegramId);
    const locale = await this.userBioService.getLocale(userId);

    const msg = `${this.localeService.t(
      'telegram.bio.select_goal',
      locale
    )}:\n`;

    return ctx.reply(
      msg,
      Markup.inlineKeyboard([
        [
          Markup.button.callback(
            `${this.localeService.t('core.goals.lose', locale)}`,
            `lose`
          )
        ],
        [
          Markup.button.callback(
            `${this.localeService.t('core.goals.keep', locale)}`,
            `keep`
          )
        ],
        [
          Markup.button.callback(
            `${this.localeService.t('core.goals.gain', locale)}`,
            `gain`
          )
        ]
      ])
    );
  }

  private async aboutMessage(ctx: IWizardSceneContext) {
    const telegramId = getTelegramUserId(ctx);
    const userId = await this.userService.getUserIdByTelegramId(telegramId);
    const locale = await this.userBioService.getLocale(userId);

    const name = await this.userBioService.getName(userId);
    const gender = await this.userBioService.getGender(userId);
    const age = await this.userBioService.getAge(userId);
    const weight = await this.userBioService.getWeight(userId);
    const height = await this.userBioService.getHeight(userId);
    const goal = await this.userBioService.getGoal(userId);
    const measureSystem =
      await this.userBioService.getMeasurementSystem(userId);

    const msg = [
      name ? `${this.localeService.t('core.about.name', locale)}: ${name}` : '',
      gender
        ? `${this.localeService.t(
            'core.about.gender',
            locale
          )}: ${this.localeService.t(`core.genders.${gender}`, locale)}`
        : '',
      age ? `${this.localeService.t('core.about.age', locale)}: ${age}` : '',
      weight
        ? `${this.localeService.t(
            'core.about.weight',
            locale
          )}: ${weight} ${this.localeService.t(
            `core.measure_system.${measureSystem}.weight_short`,
            locale
          )}`
        : '',
      height
        ? `${this.localeService.t(
            'core.about.height',
            locale
          )}: ${height} ${this.localeService.t(
            `core.measure_system.${measureSystem}.height_short`,
            locale
          )}`
        : '',
      goal
        ? `${this.localeService.t(
            'core.about.goal',
            locale
          )}: ${this.localeService.t(`core.goals.${goal}`, locale)}`
        : ''
    ].join('\n');

    return ctx.reply(msg);
  }
}
