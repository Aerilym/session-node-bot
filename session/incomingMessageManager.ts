import type { Message } from '../types';
import type { MessageHandler } from './messageHandler.ts';

export class IncomingMessageManager {
  private readonly messageHandlers: Map<number, MessageHandler> = new Map<number, MessageHandler>();

  public get length() {
    return this.messageHandlers.size;
  }

  public addMessageHandler(handler: MessageHandler) {
    if (this.messageHandlers.has(handler.id)) {
      throw new Error(`Message handler of id ${handler.id} already exists!`);
    }
    this.messageHandlers.set(handler.id, handler);
    return handler.id;
  }

  public removeMessageHandler(id: number) {
    this.messageHandlers.delete(id);
  }

  public async handleMessage(msg: Message) {
    const promises: Array<Promise<void>> = [];
    for (const [_, handler] of this.messageHandlers) {
      promises.push(handler.handleMessage(msg));
    }
    await Promise.allSettled(promises);
  }
}
