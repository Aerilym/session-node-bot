import type { Message } from '../types';
import { log } from '../logger';
import { safeTry } from '../util/try.ts';
import { client } from '../index.ts';
import { MESSAGE_SEND_RETRY_MAX } from '../env.ts';

type SendReplyWithRetriesArgs = {
  to: string;
  text: string;
  replyTo?: Message;
};

// TODO - implements long retry queue processing
const longRetryQueue: Array<SendReplyWithRetriesArgs> = [];

export async function sendReplyWithRetries(msg: Message, text: string, replyToMsg = true) {
  return sendMessageWithRetries(msg.from, text, replyToMsg ? msg : undefined);
}

export async function sendMessageWithRetries(
  to: string,
  text: string,
  replyTo?: Message,
  attempt = 0,
) {
  log.debug(`Sending message${attempt > 0 ? `, retry ${attempt}` : ''}`);
  const [err, res] = await safeTry(
    client.sendMessage({
      to,
      text,
      ...(replyTo
        ? {
            replyToMessage: {
              timestamp: replyTo.timestamp,
              author: replyTo.from,
              text: replyTo.text,
            },
          }
        : {}),
    }),
  );

  // TODO - add smarter error handling, we don't need to retry on all error types
  if (err) {
    log.error(err);
    if (attempt < MESSAGE_SEND_RETRY_MAX) {
      return sendMessageWithRetries(to, text, replyTo, attempt + 1);
    }
    const queueLength = longRetryQueue.push({ to, text, replyTo });
    log.error(
      new Error(
        `Failed to send message after ${attempt} retries. Added message to long retry queue (${queueLength})`,
      ),
    );
  }
  return res;
}
