import { SessionResponse } from '../handleCommand.ts';
import type { Command } from './command.ts';
import { stakeMessage } from '../messages/stake.ts';

export const stakeCommand: Command = {
  name: 'stake',
  aliases: [],
  description: 'Get session staking information.',
  isPublic: true,
  handler: async () => new SessionResponse(stakeMessage),
};
