import { insertUser } from '../../database';
import { users } from '../../database/users.ts';
import { log } from '../../logger';
import { encodeSessionId } from '../../util/encoding.ts';
import { safeTrySync } from '../../util/try.ts';
import { isAddress } from '../../web3/validation.ts';
import { SessionResponse } from '../handleCommand.ts';
import { alreadyJoinedMessage, getJoinSuccessMessage } from '../messages/join.ts';
import type { Command } from './command.ts';
import { ADDRESS_ACTION, handleEthAddressSubmission } from './address.ts';

export const joinCommand: Command = {
  name: 'join',
  aliases: ['j', 'register', 'r'],
  description: 'Join the bot and consent to it sending you messages.',
  isPublic: true,
  handler: async (args, msg) => {
    if (users.has(msg.from)) return new SessionResponse(alreadyJoinedMessage);

    let addedEthResponse = '';
    const address = args[0];
    if (address) {
      if (isAddress(address)) {
        addedEthResponse = handleEthAddressSubmission(msg.from, address, ADDRESS_ACTION.ADD).text;
      } else {
        return new SessionResponse(
          'Provided ethereum address is invalid. Please try again with a valid ethereum address or continue without an address',
        );
      }
    }

    const user = {
      $session_id: encodeSessionId(msg.from),
      $joined_at: Date.now(),
    };

    const [err, res] = safeTrySync(() => insertUser.run(user));

    if (err) {
      log.error(err);
      return new SessionResponse('Failed to join. Please try again later.');
    }

    log.debug('User joined: ', res);

    users.add(msg.from);
    return new SessionResponse(
      `${getJoinSuccessMessage()}${addedEthResponse === '' ? '' : `\n\n${addedEthResponse}`}`,
    );
  },
};
