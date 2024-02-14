import { inject, injectable } from 'inversify';
import { OpenAI } from 'openai';
import fs from 'fs';

import { IConfigService } from 'utils/config/config.interface';
import { ILoggerService } from 'utils/logger/logger.interface';
import { IGptService } from 'utils/gpt/gpt.interface';

import { TYPES } from 'types';

@injectable()
export class GptService implements IGptService {
  openai: OpenAI;

  constructor(
    @inject(TYPES.IConfigService)
    private readonly configService: IConfigService,
    @inject(TYPES.ILoggerService) private readonly loggerService: ILoggerService
  ) {
    this.openai = new OpenAI({
      apiKey: this.configService.get('OPENAI_API_KEY')
    });
  }

  async audioToTextTranscription(
    audioFilePath: string,
    language?: string
  ): Promise<string> {
    const { text } = await this.openai.audio.transcriptions.create({
      model: 'whisper-1',
      file: fs.createReadStream(audioFilePath),
      ...(language ? { language } : {})
    });
    return text;
  }

  async getHistory(threadId: string, limit: number) {
    const chat = await this.openai.beta.threads.messages.list(threadId, {
      limit: limit
    });

    const response = chat.data
      .sort((a, b) => a.created_at - b.created_at)
      .map((v) => {
        return {
          id: v.id,
          created_at: v.created_at,
          role: v.role,
          content: v.content
        };
      });

    return response;
  }

  async sendMessage(threadId: string, message: string) {
    await this.openai.beta.threads.messages.create(threadId, {
      role: 'user',
      content: message
    });
  }

  async waitForResponse(threadId: string) {
    const myRun = await this.openai.beta.threads.runs.create(threadId, {
      assistant_id: this.configService.get('ASSISTANT_ID')
    });

    const retrieveRun = async () => {
      let keepRetrievingRun: OpenAI.Beta.Threads.Runs.Run;

      while (myRun.status !== 'completed') {
        keepRetrievingRun = await this.openai.beta.threads.runs.retrieve(
          threadId,
          myRun.id
        );

        if (keepRetrievingRun.status === 'completed') {
          break;
        }
      }
    };
    await retrieveRun();
  }

  async sendMessageAndGetResponse(threadId: string, message: string) {
    await this.sendMessage(threadId, message);
    await this.waitForResponse(threadId);
    const response = (await this.getHistory(threadId, 1)).pop();
    return response;
  }

  async createThread(): Promise<string> {
    const thread = await this.openai.beta.threads.create();
    return thread.id;
  }
}
