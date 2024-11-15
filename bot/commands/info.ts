import { SessionResponse } from '../handleCommand.ts';
import type { Command } from './command.ts';
import { users } from '../../database/users.ts';
import { getNetworkInfo } from '../../nodes';
import { BOT_USERNAME } from '../../env.ts';
import { githubUrl } from '../messages/util.ts';

// TODO - add number of nodes watched
export const infoCommand: Command = {
  name: 'info',
  aliases: ['i'],
  description: 'Bot Info.',
  isPublic: true,
  handler: async () => {
    const nUsers = users.size;
    const networkInfo = getNetworkInfo();
    const network = networkInfo ? (networkInfo.mainnet ? 'Mainnet' : 'Testnet') : null;

    return new SessionResponse(
      `${BOT_USERNAME} Info:\nUsers: ${nUsers}\n${network ? `Network: ${network}\n` : ''}\n To learn more visit the GitHub Repo: ${githubUrl}`,
    );
  },
};
