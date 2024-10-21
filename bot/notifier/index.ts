import { getUserSubscriptionsByNodeId } from '../../database';
import { DECOMM_NOTIFICATION_FREQUENCY_MS } from '../../env.ts';
import { log } from '../../logger';
import type { SNState } from '../../nodes/getNodes.ts';
import { decodeSessionId, encodeNodeId } from '../../util/encoding.ts';
import { sendMessageWithRetries } from '../sendReplyWithRetries.ts';

function formatMinutesToRelativeTime(mins: number) {
  const hours = Math.floor(mins / 60);
  const minutes = mins % 60;

  if (hours > 0) {
    return `${hours} hours and ${minutes} minutes`;
  }
  return `${minutes} minutes`;
}

const blocksInMinutes = (blocks: number) => blocks * 2;

const lastDecommNotification = new Map<string, number>();

export const handleDecommissionedNode = async (node: SNState) => {
  const node_id = node.service_node_pubkey;
  if (!node_id) {
    return void log.error('service_node_pubkey not found', node);
  }

  const lastNotif = lastDecommNotification.get(node_id);
  if (lastNotif && lastNotif - Date.now() < DECOMM_NOTIFICATION_FREQUENCY_MS) {
    return void log.debug(`Already notified for node ${node_id} recently. Skipping...`);
  }

  // TODO - Type the db calls
  const subscriptions = getUserSubscriptionsByNodeId.all({
    $node_id: encodeNodeId(node_id),
  }) as Array<{ session_id: Uint8Array }>;

  if (!subscriptions?.length) {
    return void log.debug('No subscriptions found for node', node_id);
  }

  log.debug(`Found ${subscriptions.length} subscriptions for node`, node_id);
  // TODO REMOVE THIS LOG
  log.debug('Subscriptions:', subscriptions);

  const minsToDecom = blocksInMinutes(node.earned_downtime_blocks);

  const message = `Node ${node_id} is decommissioned. Deregistration in ${formatMinutesToRelativeTime(minsToDecom)} `;

  const messagePromises = subscriptions.map(async (subscription) => {
    const { session_id } = subscription;

    await sendMessageWithRetries(decodeSessionId(session_id), message);
  });

  await Promise.all(messagePromises);
  lastDecommNotification.set(node_id, Date.now());
};
