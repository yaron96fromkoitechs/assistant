import { injectable } from 'inversify';
import { Scenes, Telegraf } from 'telegraf';
import { BaseScene } from 'telegraf/typings/scenes';
import {
  IBaseSceneContext,
  IContext,
  IWizardSceneContext
} from 'common/telegram/context/context.interface';
import 'reflect-metadata';

export abstract class Handler {
  constructor(public bot: Telegraf<IContext>) {}

  abstract handle(): void;
}

@injectable()
export abstract class Scene {
  abstract sceneId: string;
  abstract scene:
    | BaseScene<IBaseSceneContext>
    | Scenes.WizardScene<IWizardSceneContext>;
}

@injectable()
export abstract class BaseSceneHandler {
  abstract sceneId: string;
  abstract scene: BaseScene<IBaseSceneContext>;

  abstract handle(): void;
}
