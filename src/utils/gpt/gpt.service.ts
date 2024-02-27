import { inject, injectable } from 'inversify';
import { OpenAI } from 'openai';
import fs from 'fs';

import { IConfigService } from 'utils/config/config.interface';
import { ILoggerService } from 'utils/logger/logger.interface';
import { IGptService, TMeal } from 'utils/gpt/gpt.interface';

import { TYPES } from 'types';

@injectable()
export class GptService implements IGptService {
  private openai: OpenAI;

  private nutriReportAssistantId: string;

  constructor(
    @inject(TYPES.IConfigService)
    private readonly configService: IConfigService,
    @inject(TYPES.ILoggerService) private readonly loggerService: ILoggerService
  ) {
    this.openai = new OpenAI({
      apiKey: this.configService.get('OPENAI_API_KEY')
    });

    this.nutriReportAssistantId = this.configService.get(
      'NUTRI_REPORT_FOR_MEAL_ASSISTANT_ID'
    );
  }

  public getMealTextReport = async (
    threadId: string,
    text: string
  ): Promise<string> => {
    const report = await this.sendMessageAndGetResponse(
      threadId,
      this.nutriReportAssistantId,
      text
    );

    return report;
  };

  public mealTextReportToJson = async (
    mealTextReport: string
  ): Promise<TMeal | null> => {
    try {
      const response = await this.openai.chat.completions.create({
        messages: [
          {
            role: 'system',
            content:
              "you're analyzing a meal report message. JSON format: {calories: number, protein: number, fat: number, carbohydrate: number}"
          },
          { role: 'user', content: mealTextReport }
        ],
        model: 'gpt-3.5-turbo',
        response_format: { type: 'json_object' }
      });

      const meal: TMeal = JSON.parse(response.choices[0].message.content);

      return meal;
    } catch (e) {
      this.loggerService.error({ e });
      return null;
    }
  };

  async createThread(): Promise<string> {
    const thread = await this.openai.beta.threads.create();
    return thread.id;
  }

  async sendMessageAndGetResponse(
    threadId: string,
    assistantId: string,
    message: string
  ) {
    try {
      await this.sendMessage(threadId, message);
      await this.waitForResponse(threadId, assistantId);
      const { content } = (await this.getHistory(threadId, 1)).pop();

      if (content && content[0] && 'text' in content[0]) {
        return content[0].text.value;
      }

      return '';
    } catch (e) {
      throw e;
    }
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

  private async sendMessage(threadId: string, message: string) {
    try {
      await this.openai.beta.threads.messages.create(threadId, {
        role: 'user',
        content: message
      });
    } catch (e) {
      if (e.error && e.error.message) {
        const regex =
          /Can't add messages to thread_[A-Za-z0-9]+ while a run (run_[A-Za-z0-9]+) is active\./;
        const match = e.error.message.match(regex);
        if (match) {
          const runId = match[1];
          console.log(runId);
          await this.waitForRun(threadId, runId);
          return this.sendMessage(threadId, message);
        }
      }

      throw e;
    }
  }

  private async waitForRun(threadId: string, runId: string) {
    const run = await this.openai.beta.threads.runs.retrieve(threadId, runId);

    const retrieveRun = async () => {
      let keepRetrievingRun: OpenAI.Beta.Threads.Runs.Run;

      while (run.status !== 'completed') {
        console.log(run);
        keepRetrievingRun = await this.openai.beta.threads.runs.retrieve(
          threadId,
          run.id
        );

        if (keepRetrievingRun.status === 'completed') {
          break;
        }
      }
    };
    await retrieveRun();
  }

  private async waitForResponse(threadId: string, assistantId: string) {
    const myRun = await this.openai.beta.threads.runs.create(threadId, {
      assistant_id: assistantId
    });
    await this.waitForRun(threadId, myRun.id);
  }
}
