import { rpcFetch } from './rpc.ts';

export type NetworkInfo = {
  /** The height of the current top block.  (Note that this is one less than the "blockchain height" as would be returned by the [`get_info`](#get_info) endpoint). */
  height: number;
  hard_fork: number;
  pulse_target_timestamp: number;
  staking_requirement: number;
  mainnet: boolean;
};

export const getInfo = (): Promise<NetworkInfo> => {
  return rpcFetch({
    method: 'get_info',
    params: {},
  });
};
