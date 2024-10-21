import { log } from '../logger';
import { RPC_SERVICE_NODE, RPC_SERVICE_NODE_BACKUP } from '../env.ts';

const MAX_RETRIES = 1;
export async function rpcFetch(
  { method, params }: { method: string; params: object },
  attempt = 0,
) {
  try {
    const response = await fetch(attempt === 0 ? RPC_SERVICE_NODE : RPC_SERVICE_NODE_BACKUP, {
      method: 'POST',
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: '0',
        method,
        params,
      }),
      headers: { 'Content-Type': 'application/json' },
    });

    const { result, error } = await response.json();

    if (error) {
      throw new Error(error.message);
    }

    return result;
  } catch (err) {
    if (err instanceof Error) {
      log.error(err);
    }
    log.error('RPC Fetch Error', err);
    if (attempt < MAX_RETRIES) {
      console.debug('Retrying RPC fetch with backup');
      return rpcFetch({ method, params }, attempt + 1);
    }
  }
}
