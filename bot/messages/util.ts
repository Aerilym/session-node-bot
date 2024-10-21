import { leaveCommand } from '../commands/leave.ts';
import { helpCommand } from '../commands/help.ts';

export const githubUrl = 'https://github.com/aerilym/session-node-bot';

export const getInvalidCommandResponse = () =>
  `Invalid command. Please try again with a valid command. For a list of available commands, use the /${helpCommand.name} command.`;
export const getBasicStopInfoMessage = () =>
  `To leave the bot, use the /${leaveCommand.name} command or send "STOP" to the bot. All of your information will be deleted upon confirmation.`;
