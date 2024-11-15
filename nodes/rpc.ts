import { log } from '../logger';
import { RPC_FETCH_MAX_RETRIES, RPC_SERVICE_NODE, RPC_SERVICE_NODE_BACKUP } from '../env.ts';
import { safeTry } from '../util/try.ts';

export async function rpcFetch<T = unknown>(
  { method, params }: { method: string; params: object },
  attempt = 0,
): Promise<[null, T] | [Error, null]> {
  if (attempt > RPC_FETCH_MAX_RETRIES) {
    return [new Error(`RPC fetch exceeded Max Retries (${RPC_FETCH_MAX_RETRIES})`), null];
  }

  // Alternate between the primary and backup url between attempts
  const url = attempt % 2 === 0 ? RPC_SERVICE_NODE : RPC_SERVICE_NODE_BACKUP;
  log.debug(`Starting RPC fetch: ${url}`);

  const [err, res] = await safeTry(
    fetch(url, {
      method: 'POST',
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: '0',
        method,
        params,
      }),
      headers: { 'Content-Type': 'application/json' },
    }),
  );

  if (err) {
    log.error(err);
    return rpcFetch({ method, params }, attempt + 1);
  }

  if (!res.ok) {
    log.error(
      `RPC fetch failed: (${res?.status ?? 'No Status'}) ${res?.statusText ?? 'No Status Text'}`,
    );
    return rpcFetch({ method, params }, attempt + 1);
  }

  const [jsonError, jsonRes] = await safeTry(res.json());

  if (jsonError) {
    log.error('RPC fetch failed to parse json:', jsonError);
    return rpcFetch({ method, params }, attempt + 1);
  }

  if ('error' in jsonRes && jsonRes.error) {
    log.error('RPC fetch failed:', jsonRes);
    return rpcFetch({ method, params }, attempt + 1);
  }

  if ('result' in jsonRes && jsonRes.result) {
    log.debug(`Finished RPC fetch: ${url}`);
    return [null, jsonRes.result];
  }

  log.error('RPC fetch failed, no result');
  return rpcFetch({ method, params }, attempt + 1);
}
