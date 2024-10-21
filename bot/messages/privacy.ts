import { joinCommand } from '../commands/join.ts';
import { getBasicStopInfoMessage } from './util.ts';

export const getPrivacyMessage =
  () => `Information is only stored for bot users who consent to using the bot by using the /${joinCommand.name} command. 

Use of public commands results in zero logging of user information. All non-public commands require the /${joinCommand.name} command to have been used.

After the /${joinCommand.name} command is used, the following is stored:
- Session ID: The Session ID of the user, this is stored so the bot can remember users and keep track their Session Node watch lists, enabling it to notify users of subscribed Session Node activity.
- Ethereum Address (optional): If the user provides their Ethereum address it is stored and used to identify related Session Node stakes, and inform the user of any new stake activity related to their Ethereum address.
- Subscription Preferences: Any Session Node ID the user has added to their watch list, and what kind of notifications they wish to receive.

The bot doesn't store any messages, all messages are read directly from the bot's swarm. This means even if the bot is offline when a message is sent it can respond once it reconnects to the Session Network. By the very nature of Session, any deleted messages will not be visible to the bot as they will have been deleted from its swarm.

At any time a user can request to leave the bot and all their information will be immediately deleted following their confirmation.
${getBasicStopInfoMessage()}
`;
