import { log } from '../logger';
import { decodeSessionId } from '../util/encoding.ts';
import { getAllUsers } from './index.ts';

export const users = new Set<string>();

function populateUsers() {
  // TODO - Type the db calls
  const dbUsers = getAllUsers.all() as Array<{ session_id: Uint8Array }>;
  log.debug('Populating users: ', dbUsers);
  for (const { session_id } of dbUsers) {
    users.add(decodeSessionId(session_id));
  }
}

populateUsers();
