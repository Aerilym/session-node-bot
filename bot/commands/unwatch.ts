import { deleteSubscription } from '../../database';
import { log } from '../../logger';
import { encodeNodeId, encodeSessionId } from '../../util/encoding.ts';
import { safeTrySync } from '../../util/try.ts';
import { SessionResponse } from '../handleCommand.ts';
import type { Command } from './command.ts';

export const unwatchCommand: Command = {
  name: 'unwatch',
  aliases: ['u', 'unsubscribe'],
  description: 'Unsubscribe from notifications for a node.',
  handler: async (args, msg) => {
    const nodeKey = args[0];
    if (!nodeKey) return new SessionResponse('Please provide a node id');

    // TODO - Validate node key
    const [err, res] = safeTrySync(() =>
      deleteSubscription.run({
        $session_id: encodeSessionId(msg.from),
        $node_id: encodeNodeId(nodeKey),
      }),
    );

    if (err) {
      log.error(err);
      return new SessionResponse('Failed to unwatch node. Please try again later.');
    }

    log.debug('Subscription removed: ', res);

    return new SessionResponse(
      `Successfully unsubscribed from notification for ${nodeKey}. You will no longer receive notifications for this node.`,
    );
  },
};
