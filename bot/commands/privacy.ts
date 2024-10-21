import { SessionResponse } from '../handleCommand.ts';
import type { Command } from './command.ts';
import { getPrivacyMessage } from '../messages/privacy.ts';

export const privacyCommand: Command = {
  name: 'privacy',
  aliases: [],
  description: "Get the bot's privacy information.",
  isPublic: true,
  handler: async () => new SessionResponse(getPrivacyMessage()),
};
