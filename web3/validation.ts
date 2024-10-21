// From github.com/oxen-io/websites/ TODO - import from the package once its released

type AddressInput = Uint8Array | string;

export function uint8ArrayToHexString(uint8Array: Uint8Array): string {
  let hexString = '0x';
  for (const e of uint8Array) {
    const hex = e.toString(16);
    hexString += hex.length === 1 ? `0${hex}` : hex;
  }
  return hexString;
}

/**
 * checks input if typeof data is valid Uint8Array input
 */
export const isUint8Array = (data: AddressInput): data is Uint8Array =>
  data instanceof Uint8Array ||
  data?.constructor?.name === 'Uint8Array' ||
  data?.constructor?.name === 'Buffer';

export const isHexStrict = (hex: AddressInput) =>
  typeof hex === 'string' && /^((-)?0x[0-9a-f]+|(0x))$/i.test(hex);

export type Address = `0x${string}`;

export const isAddress = (value: AddressInput): value is Address => {
  if (typeof value !== 'string' && !isUint8Array(value)) {
    return false;
  }

  let valueToCheck: string;

  if (isUint8Array(value)) {
    valueToCheck = uint8ArrayToHexString(value);
  } else if (typeof value === 'string' && !isHexStrict(value)) {
    valueToCheck = value.toLowerCase().startsWith('0x') ? value : `0x${value}`;
  } else {
    valueToCheck = value;
  }

  // check if it has the basic requirements of an address
  if (!/^(0x)?[0-9a-f]{40}$/i.test(valueToCheck)) {
    return false;
  }
  // If it's ALL lowercase or ALL upppercase
  if (/^(0x|0X)?[0-9a-f]{40}$/.test(valueToCheck) || /^(0x|0X)?[0-9A-F]{40}$/.test(valueToCheck)) {
    return true;
    // Otherwise check each case
  }
  return true;
};
