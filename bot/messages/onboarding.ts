import { joinCommand } from '../commands/join.ts';
import { supportMessage } from './support.ts';
import { getBasicStopInfoMessage } from './util.ts';
import { getJoinCommandConsent } from './join.ts';
import { BOT_USERNAME } from '../../env.ts';
import { addressCommand } from "../commands/address.ts";

export const getOnboardingMessage =
  () => `Welcome to the ${BOT_USERNAME}! This bot helps you monitor the Session Nodes you stake to.

To start using the bot, you must first opt in by using the /${joinCommand.name} command:

/${joinCommand.name}

${getJoinCommandConsent()}

After you join, you can use the /${addressCommand.name} command to add and manage Ethereum addresses. This will allow to bot to find your staked Session nodes for you, and allow you to easily add them to your watchlist:

/${addressCommand.name} add <ethereum-address>

You can also send your Ethereum address to the bot as part of the /${joinCommand.name} command:

/${joinCommand.name} <ethereum-address>

You can leave the bot at any time. ${getBasicStopInfoMessage()}

${supportMessage}

Happy staking!
`;
