import { joinCommand } from '../commands/join.ts';
import { leaveCommand } from '../commands/leave.ts';

export const getConfirmLeaveMessage = () => `Are you sure you want to leave the bot?

When you leave the bot, all watchlist data will be deleted and you will no longer receive notifications for any nodes you are watching. 

To confirm, type "/${leaveCommand.name} confirm" command.
`;
export const confirmLeaveMessageSuccess = `You have left the bot. All watchlist data has been deleted.

To re-join the bot, use the /${joinCommand.name} command.
`;
