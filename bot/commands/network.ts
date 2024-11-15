import { SessionResponse } from '../handleCommand.ts';
import type { Command } from './command.ts';
import { getNDecomNodes, getNetworkInfo, getNodesLength } from '../../nodes';

const formatNumber = (n: number) => new Intl.NumberFormat().format(n);
const formatSENT = (n: number) => `${formatNumber(n / 10 ** 9)} SENT`;

export const getNetworkInfoString = () => {
  const nNodes = getNodesLength();
  const nDecomNodes = getNDecomNodes();
  const info = getNetworkInfo();

  const network = info ? (info.mainnet ? 'Mainnet' : 'Testnet') : '';

  const formattedNetworkInfo = info
    ? `Block Height: ${formatNumber(info.height)}\nHard Fork: ${formatNumber(info.hard_fork)}\nStaking Requirement: ${formatSENT(info.staking_requirement)}\nTotal Tokens Staked: ${formatSENT(nNodes * info.staking_requirement)}`
    : '';

  return `Session Network ${network} Information:\nNodes: ${formatNumber(nNodes)}\nDecommissioned Nodes: ${formatNumber(nDecomNodes)}\n${formattedNetworkInfo}`;
};

export const networkCommand: Command = {
  name: 'network',
  aliases: ['net'],
  description: 'Get information about the Session Network.',
  isPublic: true,
  handler: async () => new SessionResponse(getNetworkInfoString()),
};
