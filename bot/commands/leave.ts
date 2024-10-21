import { deleteEthAddresses, deleteSubscriptions, deleteUser } from '../../database';
import { users } from '../../database/users.ts';
import { log } from '../../logger';
import { encodeSessionId } from '../../util/encoding.ts';
import { safeTrySync } from '../../util/try.ts';
import { SessionResponse } from '../handleCommand.ts';
import { confirmLeaveMessageSuccess, getConfirmLeaveMessage } from '../messages/leave.ts';
import type { Command } from './command.ts';

export const leaveCommand: Command = {
  name: 'leave',
  aliases: ['stop'],
  description:
    'Leave the bot. Use with "confirm" to bypass the confirmation prompt. All information will be deleted.',
  handler: async (args, msg) => {
    if (!args[0] || args[0].toLowerCase() !== 'confirm')
      return new SessionResponse(getConfirmLeaveMessage());

    const encodedId = encodeSessionId(msg.from);

    const [deleteSubsErr, deleteSubsRes] = safeTrySync(() =>
      deleteSubscriptions.run({ $session_id: encodedId }),
    );

    if (deleteSubsErr) {
      log.error(deleteSubsErr);
      return new SessionResponse('Failed to leave the bot. Please try again later.');
    }

    log.debug('Subscriptions deleted: ', deleteSubsRes);

    const [deleteEthAddrErr, deleteEthAddrRes] = safeTrySync(() =>
      deleteEthAddresses.run({ $session_id: encodedId }),
    );

    if (deleteEthAddrErr) {
      log.error(deleteEthAddrErr);
      return new SessionResponse('Failed to leave the bot. Please try again later.');
    }

    log.debug('Eth Addresses deleted: ', deleteEthAddrRes);

    const [deleteUserErr, deleteUserRes] = safeTrySync(() =>
      deleteUser.run({ $session_id: encodedId }),
    );

    if (deleteUserErr) {
      log.error(deleteUserErr);
      return new SessionResponse('Failed to leave the bot. Please try again later.');
    }

    log.debug('User deleted: ', deleteUserRes);

    users.delete(msg.from);
    return new SessionResponse(confirmLeaveMessageSuccess);
  },
};
