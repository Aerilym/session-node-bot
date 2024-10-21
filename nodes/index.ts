import type { SNState } from './getNodes.ts';
import { getInfo, type NetworkInfo } from './getInfo.ts';

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
  const address = `0x${node.operator_address}`.toUpperCase();

  const operatorNodes = nodesForOperatorEthAddress.get(address);

  nodesForOperatorEthAddress.set(
    address,
    operatorNodes ? operatorNodes.add(pubkey) : new Set([pubkey]),
  );

  for (const contributor of node.contributors) {
    const contributorAddress = `0x${contributor.address}`.toUpperCase();
    const contributorNodes = nodesForContributorEthAddress.get(contributorAddress);

    nodesForContributorEthAddress.set(
      contributorAddress,
      contributorNodes ? contributorNodes.add(pubkey) : new Set([pubkey]),
    );
  }
};

export const getNodePubkeysForOperatorAddress = (address: string) =>
  nodesForOperatorEthAddress.get(address);
export const getNodePubkeysForContributorAddress = (address: string) =>
  nodesForContributorEthAddress.get(address);

let networkInfo = await getInfo();

export const setNetworkInfo = (info: NetworkInfo) => {
  networkInfo = info;
};

export const getNetworkInfo = () => networkInfo;
