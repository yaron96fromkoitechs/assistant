import { inject, injectable } from 'inversify';

import { IGptService } from 'utils/gpt/gpt.interface';
import { IUserService } from 'entities/user/user.service.interface';

import { TYPES } from 'types';

@injectable()
export class ChatService {
  constructor(
    @inject(TYPES.IGptService) private readonly gptService: IGptService,
    @inject(TYPES.IUserService) private readonly userService: IUserService
  ) {
    //
  }

  public getNutriReportThreadId = async (userId: number): Promise<string> => {
    return this.userService.getNutriReportThreadId(userId);
  };

  public createAndSetNutriReportThreadId = async (
    userId: number
  ): Promise<void> => {
    const threadId = await this.gptService.createThread();
    await this.userService.setNutriReportThreadId(userId, threadId);
  };
}
