import { safeTrySync } from '../../util/try.ts';
import { banUser, unbanUser } from '../../database';
import { encodeSessionId } from '../../util/encoding.ts';
import { log } from '../../logger';

let bannedIds = new Set<string>();

export const isBanned = (id: string) => bannedIds.has(id);

export const banId = (id: string, reason?: string) => {
  bannedIds.add(id);

  const user = {
    $session_id: encodeSessionId(id),
    $banned_at: Date.now(),
    $reason: reason ?? null,
  };

  const [err] = safeTrySync(() => banUser.run(user));

  if (err) return void log.error(err);
};

export const unbanId = (id: string) => {
  bannedIds.delete(id);

  const [err] = safeTrySync(() => unbanUser.run({ $session_id: encodeSessionId(id) }));

  if (err) return void log.error(err);
};

export const setBannedIds = (ids: Array<string>) => {
  bannedIds = new Set(ids);
};
