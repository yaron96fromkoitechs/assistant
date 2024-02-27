import { Context, Scenes } from 'telegraf';
import { SceneContextScene, WizardContext } from 'telegraf/typings/scenes';

export type TGender = 'male' | 'female' | 'neutral';
export type TGoal = 'gain' | 'keep' | 'lose';
export type TMeasureSystem = 'metric' | 'imperial';

interface I18nContext {
  repository: {
    [languageCode: string]: {
      [namespace: string]: Record<string, string>;
    };
  };
  t: (some: string) => string;
  locale: (lang: string) => void;
}

export interface ISession {
  name: string;
  gender: TGender;
  age: number;

  measureSystem: TMeasureSystem;
  weight: number;
  height: number;

  goal: TGoal;

  nutriReportThreadId: string;
}

export interface IContext extends Context {
  session: ISession;
  i18n: I18nContext;
  scene: SceneContextScene<any>;
}

interface IWizardSceneSession extends Scenes.WizardSession, ISession {
  // will be available under ctx.scene.session.mySceneSessionProp
  session: ISession;
}

export interface IWizardSceneContext extends WizardContext, IContext {
  // will be available under ctx.myContextProp
  // myContextProp: string;
  session: IWizardSceneSession;
  scene: any;
  // scene: Scenes.SceneContextScene<IWizardSceneContext, IWizardSceneSession>;
  // wizard: Scenes.WizardContextWizard<IWizardSceneContext>;
  // i18n: I18nContext;
}

export interface IBaseSceneSession extends Scenes.SceneSession, ISession {}

export interface IBaseSceneContext extends IContext {
  // session: ISession;
  // scene: SceneContextScene<SceneContext>;
  session: IBaseSceneSession;
}
