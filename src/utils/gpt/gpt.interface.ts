import { ThreadMessage } from 'openai/resources/beta/threads/messages/messages';

export interface IGptService {
  audioToTextTranscription: (
    filepath: string,
    language?: string
  ) => Promise<string>;
  sendMessage: (threadId: string, text: string) => Promise<void>;
  waitForResponse: (threadId: string) => Promise<void>;
  sendMessageAndGetResponse: (
    threadId: string,
    text: string
  ) => Promise<Message>;
  getHistory: (threadId: string, limit: number) => Promise<Message[]>;
  createThread: () => Promise<string>;
}

type Message = Pick<ThreadMessage, 'id' | 'created_at' | 'role' | 'content'>;
