import type { Logger, Pipe } from './types.ts';
import type { FileSink } from 'bun';

type FileLogOptions = {
  fileName: string;
  highWaterMark?: number;
  internalLogger?: Logger;
};

export class FileLog implements Pipe {
  // Pipe props

  readonly buffer: Array<string> = [];
  readonly highWaterMark: number = 0;
  readonly destination: string;
  readonly log?: Logger;

  // Unique props

  readonly writer: FileSink;

  constructor({ fileName, highWaterMark }: FileLogOptions) {
    this.destination = fileName;
    if (highWaterMark) this.highWaterMark = highWaterMark;

    this.writer = Bun.file(this.destination).writer({ highWaterMark: this.highWaterMark });

    this.log?.debug('FileLog: Initialized with', {
      destination: this.destination,
      highWaterMark: this.highWaterMark,
    });
  }

  public write = (...data: Array<unknown>): number => {
    return this.writer.write(
      `${data.map((v) => (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean' ? v : JSON.stringify(v))).join(' ')}\n`,
    );
  };

  public flush = () => this.writer.flush();
}
