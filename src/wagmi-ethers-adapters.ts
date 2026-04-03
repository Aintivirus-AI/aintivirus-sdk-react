/**
 * Wagmi ↔ ethers v6 bridge (reference implementation).
 * Prefer viem-native flows where possible; use this only because sdk-core EVM is ethers-based.
 *
 * @see https://wagmi.sh/react/guides/ethers
 */

import {
  BrowserProvider,
  FallbackProvider,
  JsonRpcProvider,
  JsonRpcSigner,
  type Provider,
} from "ethers";
import type { Account, Chain, Client, Transport } from "viem";

/** Convert a viem `Client` (from `useClient`) into an ethers `Provider`. */
export function viemClientToEthersProvider(
  client: Client<Transport, Chain>,
): Provider {
  const { chain, transport } = client;
  const network = {
    chainId: chain.id,
    name: chain.name,
    ensAddress: chain.contracts?.ensRegistry?.address,
  };

  const t = transport as {
    type: string;
    url?: string;
    transports?: ReadonlyArray<{ value?: { url?: string } }>;
  };

  if (t.type === "fallback" && Array.isArray(t.transports)) {
    const urls = t.transports
      .map((x) => x.value?.url)
      .filter((u): u is string => typeof u === "string" && u.length > 0);
    if (urls.length === 0) {
      throw new Error("fallback transport has no RPC urls");
    }
    const providers = urls.map((url) => new JsonRpcProvider(url, network));
    if (providers.length === 1) return providers[0];
    return new FallbackProvider(providers);
  }

  if (typeof t.url === "string" && t.url.length > 0) {
    return new JsonRpcProvider(t.url, network);
  }

  throw new Error(`cannot derive JSON-RPC URL from transport type: ${t.type}`);
}

/** Convert a viem wallet client (from `useConnectorClient`) into an ethers `JsonRpcSigner`. */
export function viemConnectorClientToEthersSigner(
  client: Client<Transport, Chain, Account>,
): JsonRpcSigner {
  const { account, chain, transport } = client;
  if (!account?.address) {
    throw new Error("connector client has no account");
  }
  const network = {
    chainId: chain.id,
    name: chain.name,
    ensAddress: chain.contracts?.ensRegistry?.address,
  };
  const provider = new BrowserProvider(transport, network);
  return new JsonRpcSigner(provider, account.address);
}
