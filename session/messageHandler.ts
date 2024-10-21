import type { Message } from '../types';

type OnMessage = (msg: Message) => Promise<void>;

export class MessageHandler {
  public readonly id: number;
  private readonly onMessage: OnMessage;

  constructor(id: number, onMessage: OnMessage) {
    this.id = id;
    this.onMessage = onMessage;
  }

  public async handleMessage(msg: Message) {
    return this.onMessage(msg);
  }
}
