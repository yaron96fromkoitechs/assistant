import { Context, Scenes } from 'telegraf';

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

export interface ISession extends Scenes.SceneSession<IWizardSceneSession> {
  name: string;
  gender: TGender;
  age: number;

  measureSystem: TMeasureSystem;
  weight: number;
  height: number;

  goal: TGoal;

  threadId: string;
}

interface IWizardSceneSession extends Scenes.WizardSessionData {
  // will be available under ctx.scene.session.mySceneSessionProp
  // mySceneSessionProp: number;
}

export interface IWizardSceneContext extends Context {
  // will be available under ctx.myContextProp
  // myContextProp: string;
  session: ISession;
  scene: Scenes.SceneContextScene<IWizardSceneContext, IWizardSceneSession>;
  wizard: Scenes.WizardContextWizard<IWizardSceneContext>;
  i18n: I18nContext;
}

export interface IContext extends Context {
  // will be available under ctx.myContextProp
  // myContextProp: string;
  session: ISession;
  scene:
    | Scenes.SceneContextScene<IWizardSceneContext, IWizardSceneSession>
    | Scenes.SceneContextScene<IContext>;
  wizard?: Scenes.WizardContextWizard<IWizardSceneContext>;
  i18n: I18nContext;
}
