# Session Node Bot

A [Session](https://getsession.org) monitoring bot for Session Nodes. Add nodes to a watch list and get notified on Session when something happens.

To use the bot on Session, you just need to send it a message:

ONS: nodebot

Session ID: 0503ebe227d3debbe467222e4134ec660e8c68d11b54ff527204393f5f4eeca125

**Note: ** The bot currently only runs on the Session Testnet, the bot will notify you once Mainnet is available.

## Features

- ✅ Direct messages & management on [Session](https://getsession.org) 
  - ✅ Get notified on Session when something happens
  - ✅ Node decommission alerts
  - ✅ Node recommission alerts
  - ✅ Add nodes to a watch list
- ✅ Ethereum wallet node search
- ✅ Session Network information

WIP: 

- 🔳 Lookup Session Node info & stats
- 🔳 Notifications of new Open Multi-contributor nodes
- 🔳 Rewards stats

## Getting Started

To install dependencies:

```bash
bun install
```

To run:

```bash
bun start
```

### Environment Variables

| Variable                               | Explanation                                                                                             |
|----------------------------------------|---------------------------------------------------------------------------------------------------------|
| DEBUG                                  | Enable debug logging and debugging features. (if truthy) eg: 1 or true                                  |
| BOT_SECRET_KEY                         | The Session Recovery Phrase for the bot.                                                                |
| BOT_USERNAME                           | The bot's Session display name.                                                                         |
| RPC_SERVICE_NODE                       | The RPC endpoint for communicating with a Session Node. (Only used for RPC calls, not sending messages) |
| RPC_SERVICE_NODE_BACKUP                | A backup RPC endpoint if the primary fails.                                                             |
| MESSAGE_SEND_RETRY_MAX                 | Number of times to retry sending a message if if it fails.                                              |
| SESSION_REMOTE_LOG_PREFIX              | Prefix for remote info logs. eg: \[INFO\]                                                               |
| SESSION_REMOTE_LOG_ADDRESS             | Session Id to send remote info logs to.                                                                 |
| SESSION_REMOTE_LOG_PREFIX_ERROR        | Prefix for remote error logs. eg: \[ERROR\]                                                             |
| SESSION_REMOTE_LOG_ADDRESS_ERROR       | Session Id to send remote error logs to.                                                                |
| POLLER_TEST_WAIT_TIME_SECONDS          | Number of seconds to wait for the initial message poller read test to succeed on startup.               |
| POLLER_TEST_TIMESTAMP_ACCURACY_SECONDS | How accurate the timestamp the initial message needs to be in seconds.                                  |
| POLLER_NODE_FETCH_INTERVAL_SECONDS     | How often to fetch the full node list from the RPC endpoint.                                            |
| DECOMM_NOTIFICATION_FREQUENCY_SECONDS  | The minimum amount of time between sending a decommission event notification for the same node.         |
