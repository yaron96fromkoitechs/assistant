import { IContext, IWizardSceneContext } from '../context/context.interface';

export const getCallbackData = (
  ctx: IWizardSceneContext | IContext
): string => {
  return (
    ctx.update &&
    'callback_query' in ctx.update &&
    'data' in ctx.update.callback_query &&
    ctx.update.callback_query.data
  );
};

export const getMessageText = (ctx: IWizardSceneContext | IContext): string => {
  return ctx.message && 'text' in ctx.message && ctx.message.text;
};

export const getTextFromCallback = (
  ctx: IWizardSceneContext | IContext
): string => {
  const { callbackQuery } = ctx;
  return (
    callbackQuery.message &&
    'text' in callbackQuery.message &&
    callbackQuery.message.text
  );
};

export const getUserId = (ctx: IWizardSceneContext | IContext): number => {
  return ctx.from.id;
};
