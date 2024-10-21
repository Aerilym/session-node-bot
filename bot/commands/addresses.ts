import type { Command } from './command.ts';
import { listEthAddresses } from './address.ts';

export const addressesCommand: Command = {
  name: 'addresses',
  aliases: [],
  description: 'List added Ethereum addresses.',
  handler: async (_, msg) => listEthAddresses(msg.from),
};
