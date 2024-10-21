import { supportCommand } from '../commands/support.ts';
import { githubUrl } from './util.ts';
import { BOT_USERNAME } from '../../env.ts';

export const supportMessage = `If you have any questions or need assistance, please use the /${supportCommand.name} command or send a message to the bot maintainer:\n ONS: aerilym`;

export const supportMessageLog = `The ${BOT_USERNAME} is community maintained and open source. If you've found a bug, want to suggest a feature, or want to contribute to the project please visit the GitHub:
${githubUrl}

If you have any questions about the bot or are encountering any issues, please message the maintainer on Session:
ONS: aerilym 
`;
