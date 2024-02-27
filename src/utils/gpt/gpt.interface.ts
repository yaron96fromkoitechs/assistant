export interface IGptService {
  getMealTextReport: (threadId: string, mealDesc: string) => Promise<string>;
  mealTextReportToJson: (mealReport: string) => Promise<TMeal | null>;
  audioToTextTranscription: (
    filepath: string,
    language?: string
  ) => Promise<string>;
  createThread: () => Promise<string>;
}

//FIXME:
export type TMeal = {
  calories: number;
  protein: number;
  fat: number;
  carbohydrate: number;
};
