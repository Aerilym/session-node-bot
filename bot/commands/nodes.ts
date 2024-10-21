import { getUserSubscriptions } from '../../database';
import { log } from '../../logger';
import { decodeNodeId, encodeSessionId } from '../../util/encoding.ts';
import { SessionResponse } from '../handleCommand.ts';
import type { Command } from './command.ts';
import { watchCommand } from './watch.ts';
import { safeTrySync } from '../../util/try.ts';

// TODO - alias /nodes add and /nodes remove to /watch and /unwatch
export const nodesCommand: Command = {
  name: 'nodes',
  aliases: ['n', 'watchlist'],
  description: 'Get a list of your watched nodes.',
  handler: async (_args, msg) => {
    const [err, subscriptions] = safeTrySync(
      () =>
        getUserSubscriptions.all({ $session_id: encodeSessionId(msg.from) }) as Array<{
          node_id: Uint8Array;
        }>,
    );

    if (err) {
      log.error(err);
      return new SessionResponse('Failed to list nodes. Please try again later.');
    }

    log.debug(`${subscriptions.length} Subscriptions for ${msg.from}`);

    if (!subscriptions?.length) {
      return new SessionResponse(
        `You have no watched nodes. Use the /${watchCommand.name} command to add a node.`,
      );
    }

    const nodeIds = subscriptions.map(({ node_id }) => decodeNodeId(node_id));

    return new SessionResponse(
      `You have ${subscriptions.length} watched nodes.\n  ${nodeIds.join('\n  ')}`,
    );
  },
};
