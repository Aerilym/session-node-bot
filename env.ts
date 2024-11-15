export const DEBUG = Boolean(
  process.env.DEBUG && (process.env.DEBUG === '1' || process.env.DEBUG.toLowerCase() === 'true'),
);

// biome-ignore lint/style/noNonNullAssertion: This is fine
const BOT_SECRET_KEY = process.env.BOT_SECRET_KEY!;
if (!BOT_SECRET_KEY) throw new Error('BOT_SECRET_KEY is not set');

// biome-ignore lint/style/noNonNullAssertion: This is fine
const BOT_USERNAME = process.env.BOT_USERNAME!;
if (!BOT_USERNAME) throw new Error('BOT_USERNAME is not set');

// biome-ignore lint/style/noNonNullAssertion: This is fine
const MESSAGE_SEND_RETRY_MAX_STRING = process.env.MESSAGE_SEND_RETRY_MAX!;
if (!MESSAGE_SEND_RETRY_MAX_STRING) throw new Error('MESSAGE_SEND_RETRY_MAX is not set');
const MESSAGE_SEND_RETRY_MAX = Number.parseInt(MESSAGE_SEND_RETRY_MAX_STRING);

// biome-ignore lint/style/noNonNullAssertion: This is fine
const SESSION_REMOTE_LOG_ADDRESS = process.env.SESSION_REMOTE_LOG_ADDRESS!;
if (!SESSION_REMOTE_LOG_ADDRESS) throw new Error('SESSION_REMOTE_LOG_ADDRESS is not set');

// biome-ignore lint/style/noNonNullAssertion: This is fine
const SESSION_REMOTE_LOG_PREFIX = process.env.SESSION_REMOTE_LOG_PREFIX!;
if (!SESSION_REMOTE_LOG_PREFIX) throw new Error('SESSION_REMOTE_LOG_PREFIX is not set');

// biome-ignore lint/style/noNonNullAssertion: This is fine
const SESSION_REMOTE_LOG_ADDRESS_ERROR = process.env.SESSION_REMOTE_LOG_ADDRESS_ERROR!;
if (!SESSION_REMOTE_LOG_ADDRESS_ERROR)
  throw new Error('SESSION_REMOTE_LOG_ADDRESS_ERROR is not set');

// biome-ignore lint/style/noNonNullAssertion: This is fine
const SESSION_REMOTE_LOG_PREFIX_ERROR = process.env.SESSION_REMOTE_LOG_PREFIX_ERROR!;
if (!SESSION_REMOTE_LOG_PREFIX_ERROR) throw new Error('SESSION_REMOTE_LOG_PREFIX_ERROR is not set');

const POLLER_TEST_WAIT_TIME_SECONDS_STRING =
  // biome-ignore lint/style/noNonNullAssertion: This is fine
  process.env.POLLER_TEST_WAIT_TIME_SECONDS!;
if (!POLLER_TEST_WAIT_TIME_SECONDS_STRING)
  throw new Error('POLLER_TEST_WAIT_TIME_SECONDS is not set');
const POLLER_TEST_WAIT_TIME_SECONDS = Number.parseInt(POLLER_TEST_WAIT_TIME_SECONDS_STRING);

const POLLER_TEST_TIMESTAMP_ACCURACY_SECONDS_STRING =
  // biome-ignore lint/style/noNonNullAssertion: This is fine
  process.env.POLLER_TEST_TIMESTAMP_ACCURACY_SECONDS!;
if (!POLLER_TEST_TIMESTAMP_ACCURACY_SECONDS_STRING)
  throw new Error('POLLER_TEST_TIMESTAMP_ACCURACY_SECONDS is not set');
const POLLER_TEST_TIMESTAMP_ACCURACY_SECONDS = Number.parseInt(
  POLLER_TEST_TIMESTAMP_ACCURACY_SECONDS_STRING,
);

const POLLER_NODE_FETCH_INTERVAL_SECONDS_STRING =
  // biome-ignore lint/style/noNonNullAssertion: This is fine
  process.env.POLLER_NODE_FETCH_INTERVAL_SECONDS!;
if (!POLLER_NODE_FETCH_INTERVAL_SECONDS_STRING)
  throw new Error('POLLER_NODE_FETCH_INTERVAL_SECONDS is not set');
const POLLER_NODE_FETCH_INTERVAL_SECONDS = Number.parseInt(
  POLLER_NODE_FETCH_INTERVAL_SECONDS_STRING,
);

// DECOM NOTIF
const DECOMM_NOTIFICATION_FREQUENCY_SECONDS_STRING =
  // biome-ignore lint/style/noNonNullAssertion: This is fine
  process.env.DECOMM_NOTIFICATION_FREQUENCY_SECONDS!;
if (!DECOMM_NOTIFICATION_FREQUENCY_SECONDS_STRING)
  throw new Error('DECOMM_NOTIFICATION_FREQUENCY_SECONDS is not set');
const DECOMM_NOTIFICATION_FREQUENCY_MS =
  Number.parseInt(DECOMM_NOTIFICATION_FREQUENCY_SECONDS_STRING) * 1000;

// biome-ignore lint/style/noNonNullAssertion: This is fine
const RPC_SERVICE_NODE = process.env.RPC_SERVICE_NODE!;
if (!RPC_SERVICE_NODE) throw new Error('RPC_SERVICE_NODE is not set');

// biome-ignore lint/style/noNonNullAssertion: This is fine
const RPC_SERVICE_NODE_BACKUP = process.env.RPC_SERVICE_NODE_BACKUP!;
if (!RPC_SERVICE_NODE_BACKUP) throw new Error('RPC_SERVICE_NODE_BACKUP is not set');

// biome-ignore lint/style/noNonNullAssertion: This is fine
const RPC_FETCH_MAX_RETRIES_STRING = process.env.RPC_FETCH_MAX_RETRIES!;
if (!RPC_FETCH_MAX_RETRIES_STRING) throw new Error('RPC_FETCH_MAX_RETRIES is not set');
const RPC_FETCH_MAX_RETRIES = Number.parseInt(RPC_FETCH_MAX_RETRIES_STRING);

const SESSION_ADMIN_ADDRESS = process.env.SESSION_ADMIN_ADDRESS;

export {
  BOT_SECRET_KEY,
  BOT_USERNAME,
  MESSAGE_SEND_RETRY_MAX,
  SESSION_REMOTE_LOG_ADDRESS,
  SESSION_REMOTE_LOG_PREFIX,
  SESSION_REMOTE_LOG_ADDRESS_ERROR,
  SESSION_REMOTE_LOG_PREFIX_ERROR,
  POLLER_TEST_WAIT_TIME_SECONDS,
  POLLER_TEST_TIMESTAMP_ACCURACY_SECONDS,
  POLLER_NODE_FETCH_INTERVAL_SECONDS,
  DECOMM_NOTIFICATION_FREQUENCY_MS,
  RPC_SERVICE_NODE,
  RPC_SERVICE_NODE_BACKUP,
  RPC_FETCH_MAX_RETRIES,
  SESSION_ADMIN_ADDRESS,
};
