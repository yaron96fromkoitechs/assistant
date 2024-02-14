export interface IFileService {
  saveBufferToFile: (filename: string, buffer: string) => Promise<string>;
  removeFile: (filename: string) => Promise<void>;
}
