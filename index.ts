import { Session, ready } from '@session.js/client';
import { getAddedCommands, registerCommand } from './bot/commands';
import { helpCommand } from './bot/commands/help.ts';
import { joinCommand } from './bot/commands/join.ts';
import { leaveCommand } from './bot/commands/leave.ts';
import { nodesCommand } from './bot/commands/nodes.ts';
import { supportCommand } from './bot/commands/support.ts';
import { unwatchCommand } from './bot/commands/unwatch.ts';
import { watchCommand } from './bot/commands/watch.ts';
import { createBotMessageHandler } from './bot/listener.ts';
import { banId, isBanned, setBannedIds } from './bot/moderation/ban.ts';
import { handleDecommissionedNode } from './bot/notifier';
import {
  BOT_SECRET_KEY,
  BOT_USERNAME,
  DEBUG,
  DECOMM_NOTIFICATION_FREQUENCY_MS,
  MESSAGE_SEND_RETRY_MAX,
  POLLER_NODE_FETCH_INTERVAL_SECONDS,
  POLLER_TEST_TIMESTAMP_ACCURACY_SECONDS,
  POLLER_TEST_WAIT_TIME_SECONDS,
  RPC_SERVICE_NODE,
  RPC_SERVICE_NODE_BACKUP,
  SESSION_ADMIN_ADDRESS,
  SESSION_REMOTE_LOG_ADDRESS,
  SESSION_REMOTE_LOG_ADDRESS_ERROR,
  SESSION_REMOTE_LOG_PREFIX,
  SESSION_REMOTE_LOG_PREFIX_ERROR,
} from './env.ts';
import { log } from './logger';
import { getNodesLength, setNetworkInfo } from './nodes';
import { getNodes } from './nodes/getNodes.ts';
import { IncomingMessageManager } from './session/incomingMessageManager.ts';
import { MessageHandler } from './session/messageHandler.ts';
import { initPoller } from './session/poller.ts';
import type { Message } from './types';
import { safeTry, safeTrySync } from './util/try.ts';
import { getAllBannedUsers, getState, insertState, updateState } from './database';
import { privacyCommand } from './bot/commands/privacy.ts';
import { addressCommand } from './bot/commands/address.ts';
import { addressesCommand } from './bot/commands/addresses.ts';
import { networkCommand } from './bot/commands/network.ts';
import { getInfo } from './nodes/getInfo.ts';
import { stakeCommand } from './bot/commands/stake.ts';
import { infoCommand } from './bot/commands/info.ts';
import { decodeSessionId } from './util/encoding.ts';
import { onboardingCommand } from './bot/commands/onboarding.ts';
import { wait } from './util/time.ts';
import { sendMessageWithRetries, sendRawMessageWithRetries } from './bot/sendReplyWithRetries.ts';
import { AdminManager } from './bot/admin/auth.ts';
import { disableCommand } from './bot/commands/admin/disable.ts';

// Init bot
const timedLogInit = log.timed.info('Initializing bot...');

log.debug('Env:', {
  BOT_USERNAME,
  MESSAGE_SEND_RETRY_MAX,
  SESSION_REMOTE_LOG_PREFIX,
  SESSION_REMOTE_LOG_ADDRESS,
  SESSION_REMOTE_LOG_PREFIX_ERROR,
  SESSION_REMOTE_LOG_ADDRESS_ERROR,
  POLLER_TEST_WAIT_TIME_SECONDS,
  POLLER_TEST_TIMESTAMP_ACCURACY_SECONDS,
  POLLER_NODE_FETCH_INTERVAL_SECONDS,
  DECOMM_NOTIFICATION_FREQUENCY_MS,
  RPC_SERVICE_NODE,
  RPC_SERVICE_NODE_BACKUP,
});

await ready;
const client = new Session();
client.setMnemonic(BOT_SECRET_KEY, BOT_USERNAME);
const sessionId = client.getSessionID();

const testMessagePrefix = `${sessionId}`;
const testMessageContent = `${testMessagePrefix}${Math.random()}-${Date.now()}`;
log.debug('Created test message content:', testMessageContent);

// Send test message to self
const timedLogTestMessage = log.timed.info('Sending poller test message...');

let testMessageReceived = false;
let testMessageSendTime: number | undefined = undefined;
await client.sendMessage({
  to: sessionId,
  text: testMessageContent,
});
testMessageSendTime = Date.now();

timedLogTestMessage.end('Poller message sent');

// Start poller
const timedLogStartPoller = log.timed.info('Starting message manager & poller...');

const swarmMessages: Array<Message> = [];
const testMessageHandler = new MessageHandler(0, async (msg: Message) => {
  const diff = msg.timestamp - testMessageSendTime;
  if (msg.from === sessionId && msg.text === testMessageContent) {
    if (diff < POLLER_TEST_TIMESTAMP_ACCURACY_SECONDS * 1000) {
      testMessageReceived = true;
    } else {
      console.warn(
        `Poller test received a matched message but it was too late (older than ${POLLER_TEST_TIMESTAMP_ACCURACY_SECONDS}s):`,
        diff,
      );
    }
  } else {
    if (msg.text && !msg.text?.startsWith(testMessagePrefix)) {
      swarmMessages.push(msg);
    }
  }
});

export const messageManager = new IncomingMessageManager();
const testMessageHandlerId = messageManager.addMessageHandler(testMessageHandler);

initPoller(client, { interval: 2500, messageManager: messageManager });

timedLogStartPoller.end('Message manager & poller started');

// Wait for poller test message
const timedLogWaitForTestMessage = log.timed.info('Waiting for poller test message...');

const foundPolledMessage = await wait(
  () => testMessageReceived,
  POLLER_TEST_WAIT_TIME_SECONDS * 1000,
);
if (!foundPolledMessage) throw new Error('Poller test message not received');

timedLogWaitForTestMessage.end('Poller message received');

const timedLogRegister = log.timed.info('Registering Commands...');

registerCommand(joinCommand);
registerCommand(leaveCommand);
registerCommand(watchCommand);
registerCommand(unwatchCommand);
registerCommand(nodesCommand);
registerCommand(addressCommand);
registerCommand(addressesCommand);
registerCommand(supportCommand);
registerCommand(helpCommand);
registerCommand(privacyCommand);
registerCommand(networkCommand);
registerCommand(stakeCommand);
registerCommand(infoCommand);
registerCommand(onboardingCommand);
registerCommand(disableCommand);

timedLogRegister.end(`Registered ${getAddedCommands().length} commands`);

const timedLogPopulatingBans = log.timed.info('Populating bans...');
const bannedUsers = getAllBannedUsers.all() as Array<{ session_id: Uint8Array }>;
setBannedIds(bannedUsers.map((user) => decodeSessionId(user.session_id)));

// Ban the bot from itself
const botSessionId = client.getSessionID();
if (!isBanned(botSessionId)) banId(botSessionId);

timedLogPopulatingBans.end(`Populated ${bannedUsers.length} bans`);

if (POLLER_NODE_FETCH_INTERVAL_SECONDS > 0) {
  setInterval(async () => {
    const [err, res] = await safeTry(getNodes());

    if (err) return void log.error(err);

    const { decommissionedNodes } = res;
    if (decommissionedNodes.length) {
      decommissionedNodes.forEach(handleDecommissionedNode);
    }
  }, POLLER_NODE_FETCH_INTERVAL_SECONDS * 1000);

  setInterval(async () => {
    const [err, res] = await getInfo();

    if (err) return void log.error(err);

    if (!res) return;
    setNetworkInfo(res);
  }, POLLER_NODE_FETCH_INTERVAL_SECONDS * 1000);

  log.debug(`Started Node poller with interval ${POLLER_NODE_FETCH_INTERVAL_SECONDS}s`);
  const timedLogInitialPoll = log.timed.info('Fetching initial nodes...');

  await getNodes();
  if (getNodesLength() === 0)
    log.error('Found no nodes on initial fetch. Please check the network and try again.');

  timedLogInitialPoll.end('Initial nodes fetched');
}

// Replacing test onMessage function with real one
const timedLogReplacement = log.timed.info(
  'Replacing the test message handler with the real ones...',
);

messageManager.addMessageHandler(createBotMessageHandler());
messageManager.removeMessageHandler(testMessageHandlerId);

// Logs messages
if (DEBUG) {
  const loggingMessageHandler = new MessageHandler(1, async (msg: Message) => {
    log.debug('Received new message!', { from: msg.from, text: msg.text });
  });
  messageManager.addMessageHandler(loggingMessageHandler);
}

messageManager.addMessageHandler(
  new MessageHandler(3, async function handleMessage(msg: Message) {
    const [err, res] = safeTrySync(() =>
      updateState.run({ $last_message_id: msg.id, $last_message_timestamp: msg.timestamp }),
    );

    if (err) {
      log.error(err);
    } else {
      log.debug(res);
    }
  }),
);

timedLogReplacement.end(
  `Message handler replaced. Initializing with ${messageManager.length} message handlers`,
);

// Remove processed messages from the swarm messages
const missedMessages = [];
const dbState = getState.get() as {
  last_message_id: string | null;
  last_message_timestamp: number | null;
};

if (dbState) {
  log.debug('DB state fetched, processing', dbState);
  const lastMessageId = dbState.last_message_id;
  const lastMessageTimestamp = dbState.last_message_timestamp;

  log.debug('Last message:', {
    lastMessageId,
    lastMessageTimestamp,
    ISO: lastMessageTimestamp ? new Date(lastMessageTimestamp).toISOString() : lastMessageTimestamp,
    UTC: lastMessageTimestamp ? new Date(lastMessageTimestamp).toUTCString() : lastMessageTimestamp,
  });

  const sortingSwarmLog = log.timed.info(`Sorting ${swarmMessages.length} swarm messages...`);

  swarmMessages.sort((a, b) => a.timestamp - b.timestamp);
  const lastMessageIdx = swarmMessages.findIndex((m) => m.id === lastMessageId);

  sortingSwarmLog.end(`Sorted ${swarmMessages.length} swarm messages`);

  if (lastMessageIdx === -1) {
    log.warn(
      `Last msg processed ${lastMessageId} could not be found! Using last msg timestamp: ${lastMessageTimestamp}`,
    );
    for (const msg of swarmMessages) {
      if (!lastMessageTimestamp || msg.timestamp > lastMessageTimestamp) {
        missedMessages.push(msg);
      }
    }
  } else {
    if (lastMessageIdx + 1 === swarmMessages.length) {
      log.info(
        `Last msg processed ${lastMessageId} was the last msg received at ${lastMessageTimestamp}`,
      );
    } else {
      missedMessages.push(...swarmMessages.slice(lastMessageIdx + 1));
    }
  }

  // Process all missed messages
  const timedLogReplay = log.timed.info(`Processing ${missedMessages.length} missed messages...`);

  if (missedMessages.length > 100)
    throw new Error('This might be spammy, are you sure? Change the limit here to continue.');
  missedMessages.forEach(messageManager.handleMessage.bind(messageManager));

  timedLogReplay.end(`Processed ${missedMessages.length} missed messages`);
} else {
  log.warn(
    'DB state table field not found, if the bot has not processed any messages ever this is fine. Otherwise this is concerning! Adding a null row to the state table.',
  );
  const [err, res] = safeTrySync(() => insertState.run());

  if (err) {
    log.error(err);
  } else {
    log.debug(res);
  }
}

timedLogInit.end('Bot initialized');

// Send init message
const timedLogInitMessage = log.timed.info('Sending init message...');

log.remote(`${BOT_USERNAME} initialized: ${new Date().toUTCString()}`);
await log.remoteFlush();

timedLogInitMessage.end('Init message sent');

let adminManager: AdminManager | null = null;
// Request admin password
if (SESSION_ADMIN_ADDRESS) {
  log.info(`Session admin address provides, sending admin invite to ${SESSION_ADMIN_ADDRESS}`);
  adminManager = new AdminManager({ sessionId });
  const adminRequestMessage = 'Reply to this message with your admin password to set it.';
  await sendMessageWithRetries(SESSION_ADMIN_ADDRESS, adminRequestMessage);
  messageManager.addMessageHandler(
    new MessageHandler(69, async (message) => {
      if (
        message.text &&
        message.replyToMessage?.text === adminRequestMessage &&
        message.replyToMessage.author === botSessionId
      ) {
        await adminManager?.setPassword(message.text);
        messageManager.removeMessageHandler(69);
      }
    }),
  );
} else {
  log.warn('Session admin address not provided, admin functions disabled.');
}

export { client, adminManager };
