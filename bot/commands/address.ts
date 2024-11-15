import { deleteEthAddress, getUserEthAddress, insertEthAddress } from '../../database';
import { log } from '../../logger';
import { getNodePubkeysForContributorAddress, getNodePubkeysForOperatorAddress } from '../../nodes';
import { decodeAddress, encodeAddress, encodeSessionId } from '../../util/encoding.ts';
import { safeTrySync } from '../../util/try.ts';
import { SessionResponse } from '../handleCommand.ts';
import type { Command, CommandExample } from './command.ts';
import { type Address, isAddress } from '../../web3/validation.ts';
import { formatExamples } from './help.ts';

export enum ADDRESS_ACTION {
  ADD = 'add',
  REMOVE = 'remove',
  LIST = 'list',
  NODES = 'nodes',
}

const isAddressAction = (action: string): action is ADDRESS_ACTION =>
  action === 'add' || action === 'remove' || action === 'list' || action === 'nodes';

function addEthAddress(sessionId: string, address: Address) {
  const [err, res] = safeTrySync(() =>
    insertEthAddress.run({
      $session_id: encodeSessionId(sessionId),
      $eth_address: encodeAddress(address),
    }),
  );

  if (err) {
    log.error(err);
    return new SessionResponse('Failed to add Ethereum address. Please try again later.');
  }

  log.debug('Ethereum address added: ', res);

  return new SessionResponse(`Successfully added ${address}\n${getEthAddressNodes(address)}`);
}

function removeEthAddress(sessionId: string, address: Address) {
  const [err, res] = safeTrySync(() =>
    deleteEthAddress.run({
      $session_id: encodeSessionId(sessionId),
      $eth_address: encodeAddress(address),
    }),
  );

  if (err) {
    log.error(err);
    return new SessionResponse('Failed to remove Ethereum address. Please try again later.');
  }

  if (res?.changes === 0) {
    return new SessionResponse(
      'Ethereum address not found. To see your addresses use /address list',
    );
  }

  log.debug('Ethereum address removed: ', res);

  return new SessionResponse(`Successfully removed ${address}`);
}

export function listEthAddresses(sessionId: string) {
  const [err, addresses] = safeTrySync(
    () =>
      getUserEthAddress.all({ $session_id: encodeSessionId(sessionId) }) as Array<{
        eth_address: Uint8Array;
      }>,
  );

  if (err) {
    log.error(err);
    return new SessionResponse('Failed to list Ethereum addresses. Please try again later.');
  }

  if (!addresses || addresses?.length === 0) {
    return new SessionResponse(
      'You have no Ethereum addresses added. To add an address use /address add 0x0000000000000000000000000000000000000000',
    );
  }

  log.debug('Ethereum addresses found: ', addresses);

  const decodedAddresses = addresses.map(({ eth_address }) => decodeAddress(eth_address));

  return new SessionResponse(
    `You have ${addresses.length} ${addresses.length === 1 ? 'address' : 'addresses'}:\n  ${decodedAddresses.join('\n  ')}`,
  );
}

function getEthAddressNodes(address: Address) {
  const operatorNodeAddresses = getNodePubkeysForOperatorAddress(address) ?? new Set();
  const contributedNodeAddresses = getNodePubkeysForContributorAddress(address) ?? new Set();

  const contributedNotOperated = contributedNodeAddresses?.difference(operatorNodeAddresses);

  let operatorInfoMessage = '';
  if (operatorNodeAddresses.size > 0) {
    operatorInfoMessage = '\nNodes operated:\n';
    for (const id of operatorNodeAddresses) {
      operatorInfoMessage += `  ${id}\n`;
    }
  }

  let contributorInfoMessage = '';
  if (contributedNotOperated.size > 0) {
    contributorInfoMessage = '\nStaked nodes:\n';
    for (const id of contributedNotOperated) {
      contributorInfoMessage += `  ${id}\n`;
    }
  }

  let actionMessage = '';
  if (operatorNodeAddresses.size > 0 && contributedNotOperated.size > 0) {
    actionMessage = '\n\nWatch a node using the /watch command';
  }

  return `${operatorInfoMessage}${contributorInfoMessage}${actionMessage}`;
}

export function handleEthAddressSubmission(
  sessionId: string,
  address: string,
  action: ADDRESS_ACTION,
) {
  if (!isAddress(address)) {
    return new SessionResponse(
      'Provided ethereum address is invalid. Please try again with a valid ethereum address.',
    );
  }

  switch (action) {
    case ADDRESS_ACTION.ADD:
      return addEthAddress(sessionId, address);

    case ADDRESS_ACTION.REMOVE:
      return removeEthAddress(sessionId, address);

    case ADDRESS_ACTION.NODES: {
      const res = getEthAddressNodes(address);
      return new SessionResponse(res === '' ? `No stakes found for ${address}` : res);
    }
    default:
      throw new TypeError(`Invalid address action : ${action}`);
  }
}

const addressExamples: Array<CommandExample> = [
  {
    usage: '/address add 0x0000000000000000000000000000000000000000',
    result: 'Add an Ethereum address.',
  },
  {
    usage: '/address remove 0x0000000000000000000000000000000000000000',
    result: 'Remove an Ethereum address.',
  },
  {
    usage: '/address list',
    result: 'List added Ethereum addresses.',
  },
  {
    usage: '/address nodes 0x0000000000000000000000000000000000000000',
    result: 'List the nodes operated and staked to for an Ethereum address.',
  },
];

export const addressCommand: Command = {
  name: 'address',
  aliases: ['a', 'eth'],
  description:
    'Add, remove, and manage Ethereum address with bot to help it manage related stakes.',
  examples: addressExamples,
  handler: async (args, msg) => {
    const [action, address] = args;
    if (!action || !isAddressAction(action)) {
      return new SessionResponse(`Invalid address action.\n${formatExamples(addressExamples)}`);
    }

    if (action === ADDRESS_ACTION.LIST) return listEthAddresses(msg.from);

    return handleEthAddressSubmission(msg.from, address, action);
  },
};
