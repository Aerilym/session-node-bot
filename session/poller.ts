import { Poller, type Session } from '@session.js/client';
import { isBanned } from '../bot/moderation/ban.ts';
import type { IncomingMessageManager } from './incomingMessageManager.ts';

type PollerOptions = {
  interval?: number;
  messageManager: IncomingMessageManager;
};

export const initPoller = (client: Session, { interval, messageManager }: PollerOptions) => {
  const poller = new Poller({ interval });
  client.addPoller(poller);

  client.on('message', (msg) => {
    if (isBanned(msg.from)) return;
    return messageManager.handleMessage(msg);
  });
};
