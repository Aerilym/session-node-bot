export const encodeAddress = (address: string): Uint8Array =>
  new TextEncoder().encode(address.toUpperCase());
export const encodeSessionId = (sessionId: string): Uint8Array =>
  new TextEncoder().encode(sessionId);
export const encodeNodeId = (nodeId: string): Uint8Array => new TextEncoder().encode(nodeId);

export const decodeAddress = (address: Uint8Array): string =>
  new TextDecoder().decode(address).toUpperCase();
export const decodeSessionId = (sessionId: Uint8Array): string =>
  new TextDecoder().decode(sessionId);
export const decodeNodeId = (nodeId: Uint8Array): string => new TextDecoder().decode(nodeId);
