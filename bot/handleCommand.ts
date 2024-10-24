import { users } from '../database/users.ts';
import { log } from '../logger';
import type { Message } from '../types';
import { safeTry } from '../util/try.ts';
import { getCommand } from './commands';
import { splitCommand } from './commands/command.ts';
import { sendOnboardingMessage } from './listener.ts';
import { sendMessageWithRetries, sendReplyWithRetries } from './sendReplyWithRetries.ts';
import { adminManager } from '../index.ts';
import { banId } from './moderation/ban.ts';
import { disabledCommands } from './commands/admin/disable.ts';

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

const maxPasswordAttempts = 5;
const adminAttempts = new Map<string, number>();

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

  // Handle admin commands
  if (command.isAdmin) {
    if (!adminManager || !adminManager.ready) {
      const err = `Admin command (/${command.name}) was called but no admin has been set!`;
      await sendReplyWithRetries(msg, err);
      return void log.error(err);
    }

    const password = args.pop();
    if (!password)
      return void (await sendReplyWithRetries(msg, 'Password not provided for admin command'));
    if (!(await adminManager.verify(password))) {
      const senderAttemptCount = adminAttempts.get(msg.from) ?? 0;
      if (senderAttemptCount > maxPasswordAttempts) {
        banId(msg.from, `${senderAttemptCount} invalid admin password attempts`);
        adminAttempts.delete(msg.from);
        return void (await sendReplyWithRetries(
          msg,
          'You have been banned for attempting to bruteforce the admin password! To request an unbanned, please message the bot maintainer\n ONS: aerilym ',
        ));
      }
      adminAttempts.set(msg.from, senderAttemptCount + 1);
      return void (await sendReplyWithRetries(
        msg,
        `Password invalid. ${maxPasswordAttempts - senderAttemptCount} attempts remaining before your id is banned.`,
      ));
    }
  }

  if (disabledCommands.has(command.name))
    void (await sendReplyWithRetries(
      msg,
      `/${command.name} command is currently disabled, please try again later.`,
    ));

  const [err, res] = await safeTry(command.handler(args, msg));

  if (err) {
    await sendReplyWithRetries(msg, 'Something went wrong. Please try again later.');
    return void log.error(err);
  }

  if (res?.text) {
    return void (await sendReplyWithRetries(msg, res.text, res.asReply));
  }
};
