import { rpcFetch } from './rpc.ts';
import { log } from '../logger';

export type NetworkInfo = {
  /** The height of the current top block.  (Note that this is one less than the "blockchain height" as would be returned by the [`get_info`](#get_info) endpoint). */
  height: number;
  hard_fork: number;
  pulse_target_timestamp: number;
  staking_requirement: number;
  mainnet: boolean;
};

let disabled = false;

export const disableGetInfoFetch = () => {
  disabled = true;
};

export const enableGetInfoFetch = () => {
  disabled = false;
};

export const getInfo = async () => {
  if (disabled) {
    log.info('getInfo disabled, returning null');
    return [null, null];
  }
  return rpcFetch<NetworkInfo>({
    method: 'get_info',
    params: {},
  });
};
