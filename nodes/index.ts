import type { SNState } from './getNodes.ts';
import { getInfo, type NetworkInfo } from './getInfo.ts';

const formatSearchableAddress = (address: string) => {
  if (address.startsWith('0x') || address.startsWith('0X')) {
    return address.substring(2).toUpperCase();
  }
  return address.toUpperCase();
};

const nodes = new Map<string, SNState>();
const nodesForContributorEthAddress = new Map<string, Set<string>>();
const nodesForOperatorEthAddress = new Map<string, Set<string>>();

let nDecommNodes = 0;

export const getNDecomNodes = () => nDecommNodes;
export const setNDecomNodes = (n: number) => {
  nDecommNodes = n;
};

export const getNode = (pubkey: string) => nodes.get(pubkey);
export const hasNode = (pubkey: string) => nodes.has(pubkey);
export const getNodesLength = () => nodes.size;
export const setNode = (pubkey: string, node: SNState) => {
  nodes.set(pubkey, node);
  const address = formatSearchableAddress(node.operator_address);

  const operatorNodes = nodesForOperatorEthAddress.get(address);

  nodesForOperatorEthAddress.set(
    address,
    operatorNodes ? operatorNodes.add(pubkey) : new Set([pubkey]),
  );

  for (const contributor of node.contributors) {
    const contributorAddress = formatSearchableAddress(contributor.address);
    const contributorNodes = nodesForContributorEthAddress.get(contributorAddress);

    nodesForContributorEthAddress.set(
      contributorAddress,
      contributorNodes ? contributorNodes.add(pubkey) : new Set([pubkey]),
    );
  }
};

export const getNodePubkeysForOperatorAddress = (address: string) => {
  return nodesForOperatorEthAddress.get(formatSearchableAddress(address));
};
export const getNodePubkeysForContributorAddress = (address: string) => {
  return nodesForContributorEthAddress.get(formatSearchableAddress(address));
};

const [_, res] = await getInfo();

let networkInfo = res;

export const setNetworkInfo = (info: NetworkInfo) => {
  networkInfo = info;
};

export const getNetworkInfo = () => networkInfo;
