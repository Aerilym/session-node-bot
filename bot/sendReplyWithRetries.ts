import type { Message } from '../types';
import { log } from '../logger';
import { safeTry } from '../util/try.ts';
import { client } from '../index.ts';
import { MESSAGE_SEND_RETRY_MAX } from '../env.ts';

type MessageOptions = Parameters<typeof client.sendMessage>[0];

// TODO - implements long retry queue processing
const longRetryQueue: Array<MessageOptions> = [];

export async function sendReplyWithRetries(msg: Message, text: string, replyToMsg = true) {
  return sendMessageWithRetries(msg.from, text, replyToMsg ? msg : undefined);
}

export async function sendMessageWithRetries(to: string, text: string, replyTo?: Message) {
  return sendRawMessageWithRetries({
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
  });
}

export async function sendRawMessageWithRetries(options: MessageOptions, attempt = 0) {
  log.debug(`Sending message${attempt > 0 ? `, retry ${attempt}` : ''}`);
  const [err, res] = await safeTry(client.sendMessage(options));

  // TODO - add smarter error handling, we don't need to retry on all error types
  if (err) {
    log.error(err);
    if (attempt < MESSAGE_SEND_RETRY_MAX) {
      return sendRawMessageWithRetries(options, attempt + 1);
    }
    const queueLength = longRetryQueue.push(options);
    log.error(
      new Error(
        `Failed to send message after ${attempt} retries. Added message to long retry queue (${queueLength})`,
      ),
    );
  }
  return res;
}
