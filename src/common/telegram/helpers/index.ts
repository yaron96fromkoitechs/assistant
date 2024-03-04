import { NarrowedContext } from 'telegraf';
import {
  IBaseSceneContext,
  IContext,
  IWizardSceneContext
} from '../context/context.interface';
import { Message, Update } from 'telegraf/typings/core/types/typegram';
import { KeyedDistinct } from 'telegraf/typings/core/helpers/util';

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

export const getTelegramUserId = (
  ctx: IWizardSceneContext | IContext
): number => {
  return ctx.from.id;
};

export const getVoiceFileId = (
  ctx: NarrowedContext<
    IBaseSceneContext,
    Update.MessageUpdate<KeyedDistinct<Message, 'voice'>>
  >
): string => {
  const {
    update: {
      message: {
        voice: { file_id }
      }
    }
  } = ctx;

  return file_id;
};
