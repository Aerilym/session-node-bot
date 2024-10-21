import { SessionResponse } from '../handleCommand.ts';
import { supportMessageLog } from '../messages/support.ts';
import type { Command } from './command.ts';

export const supportCommand: Command = {
  name: 'support',
  aliases: ['s'],
  description: "Get the bot's support information.",
  isPublic: true,
  handler: async () => new SessionResponse(supportMessageLog),
};
