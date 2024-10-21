import { helpCommand } from '../commands/help.ts';
import { nodesCommand } from '../commands/nodes.ts';
import { supportMessage } from './support.ts';
import { getBasicStopInfoMessage, githubUrl } from './util.ts';
import { joinCommand } from '../commands/join.ts';
import { privacyCommand } from '../commands/privacy.ts';
import { BOT_USERNAME } from '../../env.ts';

export const getJoinCommandConsent = () =>
  `By using the /${joinCommand.name} command you are consenting to the bot sending you messages and storing your preferences eg: the nodes you are watching. For full details on stored information use the /${privacyCommand.name} command or visit ${githubUrl}`;

export const getJoinSuccessMessage = () => `
Successfully joined. Welcome!

${getJoinCommandConsent()}

${getBasicStopInfoMessage()}

Use the /${helpCommand.name} command to get a list of available commands.

For more information on how to use the bot, please refer to the documentation: ${githubUrl}
Thank you for using ${BOT_USERNAME}! ${supportMessage}

Happy staking!`;

export const alreadyJoinedMessage = `You are already a user of ${BOT_USERNAME}. Use the /${nodesCommand.name} command to see your watched nodes.`;
