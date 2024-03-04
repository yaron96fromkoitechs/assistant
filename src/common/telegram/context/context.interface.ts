import { Context, Scenes } from 'telegraf';
import { SceneContextScene, WizardContext } from 'telegraf/typings/scenes';

export interface ISession {}

export interface IContext extends Context {
  session: ISession;
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
}

export interface IBaseSceneSession extends Scenes.SceneSession, ISession {}

export interface IBaseSceneContext extends IContext {
  // session: ISession;
  // scene: SceneContextScene<SceneContext>;
  session: IBaseSceneSession;
}
