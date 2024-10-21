// Improved from github.com/oxen-io/websites/ TODO - import from the package once its released

import type { Logger, Pipe } from './types.ts';
import { safeTry } from '../util/try.ts';
import { sendMessageWithRetries } from '../bot/sendReplyWithRetries.ts';

type TemplateFunction = (text: string) => string;

export type SessionLogOptions = {
  sessionId: string;
  template: TemplateFunction;
  highWaterMark?: number;
  internalLogger?: Logger;
};

export class SessionLog implements Pipe {
  // Pipe props

  readonly buffer: Array<string> = [];
  readonly highWaterMark: number = 0;
  readonly destination: string;
  readonly log?: Logger;

  // Unique props

  readonly template: TemplateFunction;

  constructor({ sessionId, template, internalLogger, highWaterMark }: SessionLogOptions) {
    if (internalLogger) this.log = internalLogger;
    this.destination = sessionId;
    this.template = template;
    if (highWaterMark) this.highWaterMark = highWaterMark;

    this.log?.debug('SessionLog: Initialized with', {
      destination: this.destination,
      highWaterMark: this.highWaterMark,
    });
  }

  public write(...data: Array<unknown>): number {
    const bufferLength = this.buffer.push(this.template(data.join(' ')));
    if (bufferLength >= this.highWaterMark) void this.flush();
    return bufferLength;
  }

  public async flush(): Promise<number> {
    const bufferLength = this.buffer.length;
    if (bufferLength > 0) {
      this.log?.debug(`SessionLog: flushing ${bufferLength} entries`);

      let message = '';
      let i = 0;
      while (this.buffer.length > 0) {
        message += `${this.buffer.shift()}\n`;
        i++;
      }

      const [err, res] = await safeTry(this.sendMessage(message));

      if (err) {
        this.log?.error('SessionLog:', err);
      } else {
        this.log?.debug('SessionLog:', res);
      }
      return i;
    }
    return 0;
  }

  private async sendMessage(text: string): Promise<unknown> {
    return sendMessageWithRetries(this.destination, text);
  }
}
