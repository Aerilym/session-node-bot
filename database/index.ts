import { Database } from 'bun:sqlite';

const db = new Database('bot.db', { create: true });
db.exec('PRAGMA journal_mode = WAL;');

//////////////////////////////////////////////////////////////
//                                                          //
//                          Users                           //
//                                                          //
//////////////////////////////////////////////////////////////
db.run(
  'CREATE TABLE IF NOT EXISTS users (session_id BLOB PRIMARY KEY, joined_at INTEGER, subscribed_to_all_operated_nodes BOOLEAN, subscribed_to_all_stakes BOOLEAN)',
);
db.run('CREATE UNIQUE INDEX IF NOT EXISTS idx_users ON users(session_id)');
db.run(
  'CREATE UNIQUE INDEX IF NOT EXISTS idx_users_subs ON users(session_id, subscribed_to_all_operated_nodes, subscribed_to_all_stakes)',
);

export const hasUser = db.query(
  'SELECT COUNT(session_id) FROM users WHERE session_id = $session_id',
);
export const getUser = db.query(
  'SELECT session_id, subscribed_to_all_operated_nodes, subscribed_to_all_stakes FROM users WHERE session_id = $session_id',
);
export const getAllUsers = db.query('SELECT session_id FROM users');
export const insertUser = db.query(
  'INSERT INTO users (session_id, joined_at) VALUES ($session_id, $joined_at)',
);
export const deleteUser = db.query('DELETE FROM users WHERE session_id = $session_id');

//////////////////////////////////////////////////////////////
//                                                          //
//                     Subscriptions                        //
//                                                          //
//////////////////////////////////////////////////////////////
db.run(
  'CREATE TABLE IF NOT EXISTS subscriptions (id NUMBER PRIMARY KEY, session_id BLOB, node_id BLOB, FOREIGN KEY (session_id) REFERENCES users(session_id))',
);
db.run('CREATE INDEX IF NOT EXISTS idx_subscriptions ON subscriptions(session_id, node_id)');
db.run('CREATE INDEX IF NOT EXISTS idx_subscriptions_node_id ON subscriptions(node_id)');
db.run('CREATE INDEX IF NOT EXISTS idx_subscriptions_session_id ON subscriptions(session_id)');

export const getUserSubscriptions = db.query(
  'SELECT node_id FROM subscriptions WHERE session_id = $session_id',
);
export const getUserSubscriptionsByNodeId = db.query(
  'SELECT session_id FROM subscriptions WHERE node_id = $node_id',
);
export const insertSubscription = db.query(
  'INSERT INTO subscriptions (session_id, node_id) VALUES ($session_id, $node_id)',
);
export const deleteSubscription = db.query(
  'DELETE FROM subscriptions WHERE session_id = $session_id AND node_id = $node_id',
);
export const deleteSubscriptions = db.query(
  'DELETE FROM subscriptions WHERE session_id = $session_id',
);

//////////////////////////////////////////////////////////////
//                                                          //
//                     Eth Addresses                        //
//                                                          //
//////////////////////////////////////////////////////////////
db.run(
  'CREATE TABLE IF NOT EXISTS eth_addresses (id NUMBER PRIMARY KEY, session_id BLOB, eth_address BLOB, FOREIGN KEY (session_id) REFERENCES users(session_id))',
);
db.run('CREATE INDEX IF NOT EXISTS idx_eth_addresses ON eth_addresses(session_id, eth_address)');
db.run('CREATE INDEX IF NOT EXISTS idx_eth_addresses_eth_address ON eth_addresses(eth_address)');
db.run('CREATE INDEX IF NOT EXISTS idx_eth_addresses_session_id ON eth_addresses(session_id)');

export const getUserEthAddress = db.query(
  'SELECT eth_address FROM eth_addresses WHERE session_id = $session_id',
);
export const getUserForEthAddress = db.query(
  'SELECT session_id FROM eth_addresses WHERE eth_address = eth_address',
);
export const insertEthAddress = db.query(
  'INSERT INTO eth_addresses (session_id, eth_address) VALUES ($session_id, $eth_address)',
);
export const deleteEthAddress = db.query(
  'DELETE FROM eth_addresses WHERE session_id = $session_id AND eth_address = $eth_address',
);
export const deleteEthAddresses = db.query(
  'DELETE FROM eth_addresses WHERE session_id = $session_id',
);

//////////////////////////////////////////////////////////////
//                                                          //
//                      Banned Users                        //
//                                                          //
//////////////////////////////////////////////////////////////
db.run(
  'CREATE TABLE IF NOT EXISTS banned_users (session_id BLOB PRIMARY KEY, banned_at INTEGER, reason STRING)',
);
db.run('CREATE INDEX IF NOT EXISTS idx_banned_users ON banned_users(session_id)');
db.run(
  'CREATE INDEX IF NOT EXISTS idx_banned_users_and_reason ON banned_users(session_id, reason)',
);

export const getAllBannedUsers = db.query('SELECT session_id FROM banned_users');
export const banUser = db.query(
  'INSERT INTO banned_users (session_id, banned_at, reason) VALUES ($session_id, $banned_at, $reason)',
);
export const unbanUser = db.query('DELETE FROM banned_users WHERE session_id = $session_id');

//////////////////////////////////////////////////////////////
//                                                          //
//                         State                            //
//                                                          //
//////////////////////////////////////////////////////////////
db.run(
  'CREATE TABLE IF NOT EXISTS state (id NUMBER PRIMARY KEY, last_message_id TEXT, last_message_timestamp NUMBER)',
);
db.run(
  'CREATE INDEX IF NOT EXISTS idx_state ON state(id, last_message_id, last_message_timestamp)',
);

export const getState = db.query(
  'SELECT last_message_id, last_message_timestamp FROM state WHERE id = 1',
);
export const insertState = db.query(
  'INSERT INTO state (id, last_message_id, last_message_timestamp) VALUES (1, null, null)',
);
export const updateState = db.query(
  'UPDATE state SET last_message_id = $last_message_id, last_message_timestamp = $last_message_timestamp WHERE id = 1',
);
