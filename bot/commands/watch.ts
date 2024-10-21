import { insertSubscription } from '../../database';
import { log } from '../../logger';
import { getNode } from '../../nodes';
import { encodeNodeId, encodeSessionId } from '../../util/encoding.ts';
import { safeTrySync } from '../../util/try.ts';
import { SessionResponse } from '../handleCommand.ts';
import type { Command } from './command.ts';

export const watchCommand: Command = {
  name: 'watch',
  aliases: ['w', 'subscribe'],
  description: 'Subscribe to notifications for a node.',
  handler: async (args, msg) => {
    const nodeKey = args[0];
    if (!nodeKey) return new SessionResponse('Please provide a node id');

    if (!getNode(nodeKey)) {
      return new SessionResponse(
        'Node not found. If you just registered, please wait a few minutes for the registration to propagate.',
      );
    }

    // TODO - Validate node key
    const [err, res] = safeTrySync(() =>
      insertSubscription.run({
        $session_id: encodeSessionId(msg.from),
        $node_id: encodeNodeId(nodeKey),
      }),
    );

    if (err) {
      log.error(err);
      return new SessionResponse('Failed to watch node. Please try again later.');
    }

    log.debug('Subscription added: ', res);

    return new SessionResponse(
      `Successfully subscribed to notification for ${nodeKey}. You will receive notifications when the node is decommissioned.`,
    );
  },
};
