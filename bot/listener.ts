import { users } from '../database/users.ts';
import { MessageHandler } from '../session/messageHandler.ts';
import type { Message } from '../types';
import { isCommand } from './classifiers/command.ts';
import { isStopMessage } from './classifiers/stop.ts';
import { leaveCommand } from './commands/leave.ts';
import { handleCommand } from './handleCommand.ts';
import { getOnboardingMessage } from './messages/onboarding.ts';
import { sendReplyWithRetries } from './sendReplyWithRetries.ts';

export async function sendOnboardingMessage(msg: Message) {
  return void (await sendReplyWithRetries(msg, getOnboardingMessage()));
}

export const createBotMessageHandler = () =>
  new MessageHandler(10, async function handleMessage(msg: Message) {
    const msgText = msg.text;
    if (!msgText) return;
    if (isCommand(msgText)) return handleCommand(msgText, msg);
    if (msgText === 'ping') return void sendReplyWithRetries(msg, 'pong');

    const isUser = users.has(msg.from);
    if (isUser && isStopMessage(msgText) && users.has(msg.from)) {
      return handleCommand(`/${leaveCommand.name}`, msg);
    }
    if (!isUser) return sendOnboardingMessage(msg);
  });
