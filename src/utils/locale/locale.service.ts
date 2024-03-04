import { injectable } from 'inversify';

import * as fs from 'fs';
import * as path from 'path';

import i18next from 'i18next';
import FsBackend, { FsBackendOptions } from 'i18next-fs-backend';

@injectable()
export class LocaleService {
  private localesPath: string;

  private i18: typeof i18next;

  private availableLangs: string[];

  constructor() {
    this.localesPath = path.join(__dirname, '../../common/locales');

    this.i18 = i18next.createInstance();
    this.i18
      .use(FsBackend)
      .init<FsBackendOptions>({
        lng: 'en',
        fallbackLng: 'en',
        preload: fs
          .readdirSync(this.localesPath)
          .filter((fileName) => {
            const joinedPath = path.join(path.join(this.localesPath), fileName);
            const isDirectory = fs.lstatSync(joinedPath).isFile();
            return isDirectory;
          })
          .map((v) => v.split('.')[0]),
        initImmediate: false,
        backend: {
          loadPath: path.join(this.localesPath, '{{lng}}.json')
        }
      })
      .then(() => {
        this.availableLangs = Object.keys(
          this.i18.services.resourceStore.data
        ).map((filename) => {
          return path.basename(filename, path.extname(filename));
        });
      });
  }

  public t(key: string, lng: string): string {
    return this.i18.t(key, { lng });
  }

  public getAvailableLangs(): string[] {
    return this.availableLangs;
  }
}
