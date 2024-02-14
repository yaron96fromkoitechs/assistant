import { writeFileSync, existsSync, mkdirSync, rmSync } from 'fs';
import { injectable } from 'inversify';
import { IFileService } from './file.interface';

@injectable()
export class FileService implements IFileService {
  private uploadDir = 'uploads';

  constructor() {
    if (!existsSync(this.uploadDir)) {
      mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async saveBufferToFile(filename: string, buffer: string): Promise<string> {
    const path = `${this.uploadDir}/${filename}`;
    writeFileSync(path, buffer);

    return path;
  }

  async removeFile(filename: string): Promise<void> {
    const path = `${this.uploadDir}/${filename}`;
    rmSync(path);
  }
}
