import { SessionResponse } from '../handleCommand.ts';
import type { Command } from './command.ts';
import { getNDecomNodes, getNetworkInfo, getNodesLength } from '../../nodes';

const formatNumber = (n: number) => new Intl.NumberFormat().format(n);
const formatSENT = (n: number) => `${formatNumber(n / 10 ** 9)} SENT`;

export const getNetworkInfoString = () => {
  const nNodes = getNodesLength();
  const nDecomNodes = getNDecomNodes();
  const { height, hard_fork, staking_requirement, mainnet } = getNetworkInfo();

  const totalTokensStaked = nNodes * staking_requirement;

  const network = mainnet ? 'Mainnet' : 'Testnet';

  return `Session Network ${network} Information:\nNodes: ${formatNumber(nNodes)}\nDecommissioned Nodes: ${formatNumber(nDecomNodes)}\nBlock Height: ${formatNumber(height)}\nHard Fork: ${formatNumber(hard_fork)}\nStaking Requirement: ${formatSENT(staking_requirement)}\nTotal Tokens Staked: ${formatSENT(totalTokensStaked)}`;
};

export const networkCommand: Command = {
  name: 'network',
  aliases: ['net'],
  description: 'Get information about the Session Network.',
  isPublic: true,
  handler: async () => new SessionResponse(getNetworkInfoString()),
};
