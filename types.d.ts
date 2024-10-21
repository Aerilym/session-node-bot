// TODO - contribute back fixes for the types

import type { EnvelopePlus } from '@session.js/types/envelope';
import type { SignalService } from '@session.js/types/signal-bindings';

export type Profile = {
  /** Name, displayed instead of your Session ID. Acts like nickname. All unicode characters are accepted except for `ￒ` (0xffd2) which is reserved by Session for mentions. Max length: 64 characters */
  displayName: string;
  /** Image, displayed near display name in Session clients. Acts like profile picture. */
  avatar?: {
    /** URL to avatar, uploaded to Session file server */
    url: string;
    /** 32 bytes key used for avatar encryption */
    key: Uint8Array;
  };
};
export type PrivateMessage = {
  type: 'private';
};
export type ClosedGroupMessage = {
  type: 'group';
  groupId: string;
};
export type MessageAttachment = {
  id: string;
  caption?: string;
  metadata: {
    width?: number;
    height?: number;
    contentType?: string;
  };
  /** Size of attached file in bytes */
  size?: number;
  /** Filename including extension */
  name?: string;
  /** For internal decryption purposes */
  _key?: Uint8Array;
  /** For internal decryption purposes */
  _digest?: Uint8Array;
};

export type QuotedAttachment = {
  contentType?: string;
  fileName?: string;
};

export type Message = (PrivateMessage | ClosedGroupMessage) & {
  id: string;
  from: string;
  author: Profile;
  text?: string;
  attachments: MessageAttachment[];
  replyToMessage?: {
    timestamp: number;
    author: string;
    text?: string;
    attachments?: QuotedAttachment[];
  };
  timestamp: number;
  getEnvelope: () => EnvelopePlus;
  getContent: () => SignalService.Content;
  getReplyToMessage: () => Message['replyToMessage'];
};
