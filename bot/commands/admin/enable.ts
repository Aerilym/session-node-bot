import { SessionResponse } from '../../handleCommand.ts';

import type { Command } from '../command.ts';
import { getCommand } from '../index.ts';
import { getInvalidCommandResponse } from '../../messages/util.ts';
import { disableGetNodesFetch, enableGetNodesFetch } from '../../../nodes/getNodes.ts';
import { disableGetInfoFetch, enableGetInfoFetch } from '../../../nodes/getInfo.ts';
import { disabledCommands } from './disable.ts';

export const enableCommand: Command = {
  name: 'enable',
  aliases: [],
  description: 'Enable a command or functionality.',
  isAdmin: true,
  handler: async (args) => {
    const selectedCommand = args[0];
    if (selectedCommand) {
      const command = getCommand(selectedCommand);
      if (!command) {
        if (selectedCommand === 'getNodesFetch') {
          enableGetNodesFetch();
          return new SessionResponse('Enabled functionality');
        }
        if (selectedCommand === 'getInfoFetch') {
          enableGetInfoFetch();
          return new SessionResponse('Enabled functionality');
        }
        return new SessionResponse(getInvalidCommandResponse());
      }

      if (!disabledCommands.has(command.name))
        return new SessionResponse('Command already enabled');
      disabledCommands.delete(command.name);
      return new SessionResponse('Command enabled');
    }

    return new SessionResponse('Provide a command name to enable');
  },
};
