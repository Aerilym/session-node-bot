import { log } from '../logger';
import { setNDecomNodes, setNode } from './index.ts';
import { rpcFetch } from './rpc.ts';

export type SNState = {
  contributors: Array<{
    address: string;
    amount: number;
  }>;
  service_node_pubkey: string;
  staking_requirement: number;
  total_reserved: number;
  total_contributed: number;
  active: boolean;
  funded: boolean;
  earned_downtime_blocks: number;
  state_height: number;
  operator_address: string;
};

let disabled = false;

export const disableGetNodesFetch = () => {
  disabled = true;
};

export const enableGetNodesFetch = () => {
  disabled = false;
};

export const getNodes = async () => {
  const decommissionedNodes: SNState[] = [];
  if (disabled) {
    log.info('getNodes disabled. Returning empty decomm list');
    return { decommissionedNodes };
  }
  const [err, res] = await rpcFetch<{
    service_node_states?: Array<SNState>;
  }>({
    method: 'get_service_nodes',
    params: {},
  });

  if (err) {
    log.error(err);
    return { decommissionedNodes };
  }

  if (
    res &&
    'service_node_states' in res &&
    res.service_node_states &&
    Array.isArray(res.service_node_states) &&
    res.service_node_states.length
  ) {
    log.debug(`Found ${res.service_node_states.length} nodes`);
    for (const sn of res.service_node_states) {
      if ('active' in sn && 'funded' in sn && sn.funded) {
        setNode(sn.service_node_pubkey, sn);
        if (!sn.active) {
          decommissionedNodes.push(sn);
        }
      }
    }
    setNDecomNodes(decommissionedNodes.length);
    log.debug(`Found ${decommissionedNodes.length} decommissioned nodes`);
  } else {
    log.error('No nodes found');
  }

  return { decommissionedNodes };
};
