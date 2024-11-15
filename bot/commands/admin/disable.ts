import { SessionResponse } from '../../handleCommand.ts';

import type { Command } from '../command.ts';
import { getCommand } from '../index.ts';
import { getInvalidCommandResponse } from '../../messages/util.ts';
import { disableGetNodesFetch } from '../../../nodes/getNodes.ts';
import { disableGetInfoFetch } from '../../../nodes/getInfo.ts';

export const disabledCommands = new Set<string>();

export const disableCommand: Command = {
  name: 'disable',
  aliases: [],
  description: 'Disable a command or functionality.',
  isAdmin: true,
  handler: async (args) => {
    const selectedCommand = args[0];
    if (selectedCommand) {
      const command = getCommand(selectedCommand);
      if (!command) {
        if (selectedCommand === 'getNodesFetch') {
          disableGetNodesFetch();
          return new SessionResponse('Disabled functionality');
        }
        if (selectedCommand === 'getInfoFetch') {
          disableGetInfoFetch();
          return new SessionResponse('Disabled functionality');
        }
        return new SessionResponse(getInvalidCommandResponse());
      }

      if (disabledCommands.has(command.name))
        return new SessionResponse('Command already disabled');
      disabledCommands.add(command.name);
      return new SessionResponse('Command disabled');
    }

    return new SessionResponse('Provide a command name to disable');
  },
};
