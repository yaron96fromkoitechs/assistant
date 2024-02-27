import { Job, Queue, QueueOptions, Worker } from 'bullmq';
import { inject, injectable } from 'inversify';

import { IConfigService } from 'utils/config/config.interface';
import { ILoggerService } from 'utils/logger/logger.interface';
import { TelegramService } from 'utils/telegram/telegram.service';

import { TYPES } from 'types';
import axios from 'axios';
import { IFileService } from 'utils/file/file.interface';
import { IGptService } from 'utils/gpt/gpt.interface';
import { IMealService } from 'entities/meal/user.meal.service.interface';
import { IUserService } from 'entities/user/user.service.interface';

export enum Queues {
  TELEGRAM = 'telegram'
}

export enum JobType {
  PROCESS_MEAL_TEXT_REPORT = 'process-meal-text-report',
  PROCESS_MEAL_AUDIO_REPORT = 'process-meal-audio-report',
  PROCESS_MEAL_TEXT_REPORT_TO_JSON = 'process-meal-text-report-to-json'
}

interface TelegramJobData {
  threadId: string;
  userId: number;
  text: string;
}

@injectable()
export class QueueService {
  private QUEUE_OPTIONS: QueueOptions;

  private queues: Record<string, Queue>;

  private telegramQueue: Queue;
  private telegramQueueWorker: Worker;

  constructor(
    @inject(TYPES.IConfigService) private readonly config: IConfigService,
    @inject(TYPES.ILoggerService) private readonly logger: ILoggerService,
    @inject(TYPES.TelegramService)
    private readonly telegramService: TelegramService,
    @inject(TYPES.IFileService) private readonly fileService: IFileService,
    @inject(TYPES.IGptService) private readonly gptService: IGptService,
    @inject(TYPES.IMealService) private readonly mealService: IMealService,
    @inject(TYPES.IUserService) private readonly userService: IUserService
  ) {
    this.QUEUE_OPTIONS = {
      defaultJobOptions: {
        removeOnComplete: false, // this indicates if the job should be removed from the queue once it's complete
        removeOnFail: false // this indicates if the job should be removed from the queue if it fails
      },
      connection: {
        host: this.config.get('REDIS_HOST').split('//').pop(),
        port: Number(this.config.get('REDIS_PORT'))
      }
    };

    this.queues = {};

    this.instantiateQueues();
    this.instantiateWorkers();
  }

  private async instantiateQueues() {
    this.telegramQueue = new Queue<TelegramJobData>(
      Queues.TELEGRAM,
      this.QUEUE_OPTIONS
    );
    this.queues[Queues.TELEGRAM] = this.telegramQueue;
  }

  private async instantiateWorkers() {
    this.telegramQueueWorker = new Worker(
      Queues.TELEGRAM,
      async (job: Job<TelegramJobData | any>) => {
        switch (job.name) {
          case JobType.PROCESS_MEAL_TEXT_REPORT: {
            const { threadId, telegramId, text } = job.data;

            this.telegramService.sendAction(telegramId, 'typing');
            const some = setInterval(() => {
              this.telegramService.sendAction(telegramId, 'typing');
            }, 5000);

            const report = await this.gptService.getMealTextReport(
              threadId,
              text
            );

            clearInterval(some);

            this.telegramService.sendMealReportResult(telegramId, report);
            break;
          }

          case JobType.PROCESS_MEAL_TEXT_REPORT_TO_JSON: {
            const { telegramId, text } = job.data;

            console.log({ telegramId, text });

            const meal = await this.gptService.mealTextReportToJson(text);

            console.log({ meal });

            // if (meal) {

            // }

            const user = await this.userService.getUserByTelegram(telegramId);

            await this.mealService.create(user.id, meal);

            break;
          }

          case JobType.PROCESS_MEAL_AUDIO_REPORT: {
            const { fileId, threadId, telegramId } = job.data;

            const link =
              await this.telegramService.bot.telegram.getFileLink(fileId);
            const res = await axios(link.href, { responseType: 'arraybuffer' });
            const filename = `${new Date().getTime()}.oga`;
            const path = await this.fileService.saveBufferToFile(
              filename,
              res.data
            );
            const text = await this.gptService.audioToTextTranscription(path);
            await this.fileService.removeFile(filename);

            const report = await this.gptService.getMealTextReport(
              threadId,
              text
            );

            this.telegramService.sendMealReportResult(telegramId, report);
          }
        }
        this.logger.log('[TELEGRAM QUEUE] Worker for default queue');
      },
      {
        connection: this.QUEUE_OPTIONS.connection,
        removeOnComplete: { age: 1 }
      }
    );
  }

  getQueue(name: Queues) {
    return this.queues[name];
  }
}
