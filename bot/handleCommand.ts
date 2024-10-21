import { users } from '../database/users.ts';
import { log } from '../logger';
import type { Message } from '../types';
import { safeTry } from '../util/try.ts';
import { getCommand } from './commands';
import { splitCommand } from './commands/command.ts';
import { sendOnboardingMessage } from './listener.ts';
import { sendReplyWithRetries } from './sendReplyWithRetries.ts';

export type SessionResponseOptions = {
  asReply?: boolean;
};

export class SessionResponse {
  public readonly text: string;
  public asReply = true;

  constructor(text: string, options?: SessionResponseOptions) {
    this.text = text;
    if (options?.asReply) {
      this.asReply = options.asReply;
    }
  }
}

export const handleCommand = async (msgText: string, msg: Message) => {
  const { name, args } = splitCommand(msgText);

  const command = getCommand(name);

  if (!command) {
    return void (await sendReplyWithRetries(
      msg,
      'Invalid command. Please try again with a valid command. For a list of available commands, use the /help command.',
    ));
  }

  if (!command.isPublic && !users.has(msg.from)) {
    return void (await sendOnboardingMessage(msg));
  }

  const [err, res] = await safeTry(command.handler(args, msg));

  if (err) {
    await sendReplyWithRetries(msg, 'Something went wrong. Please try again later.');
    return void log.error(err);
  }

  if (res?.text) {
    return void (await sendReplyWithRetries(msg, res.text, res.asReply));
  }
};
