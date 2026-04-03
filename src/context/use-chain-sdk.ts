"use client";

import { JsonRpcProvider, type Provider } from "ethers";
import { useMemo } from "react";
import type { Account, Chain, Client, Transport } from "viem";
import { useConfig, useConnectorClient, usePublicClient } from "wagmi";
import {
  viemClientToEthersProvider,
  viemConnectorClientToEthersSigner,
} from "../wagmi-ethers-adapters";
import type { MixerContextValue, SelectedChain } from "./types";

import { Keypair, type Connection } from "@solana/web3.js";
import { Wallet as AnchorWallet } from "@coral-xyz/anchor";
import type { Config } from "wagmi";

/**
 * Resolves chain-bound SDK for the selected chain: EVM (signer when wallet connected, else read-only RPC)
 * or Solana (wallet + connection). When no Solana wallet is connected, a throwaway keypair is used so
 * read-only APIs (e.g. subgraph-like query stats) still work via chainSDK.
 *
 * Pass `wagmiConfig` (same object as WagmiProvider) when this hook cannot rely on WagmiContext alone.
 * Still need QueryClientProvider for connector client queries.
 */
export function useChainSDK(
  baseValue: MixerContextValue,
  selectedChain: SelectedChain | undefined,
  solanaWallet?: AnchorWallet,
  solanaConnection?: Connection,
  wagmiConfigProp?: Config,
): MixerContextValue["chainSDK"] {
  const evmChainId =
    selectedChain?.family === "evm" ? selectedChain.chainId : undefined;

  const config = useConfig(
    wagmiConfigProp != null ? { config: wagmiConfigProp } : {},
  );

  const publicClient = usePublicClient({
    config,
    ...(evmChainId != null ? { chainId: evmChainId } : {}),
  });
  const connectorQuery = useConnectorClient({
    config,
    ...(evmChainId != null ? { chainId: evmChainId } : {}),
  });
  const walletClient = connectorQuery.data;

  return useMemo(() => {
    if (!baseValue.mixerSdkInstance || !selectedChain) return null;

    if (selectedChain.family === "evm") {
      const evmChainConfig = baseValue.getEvmChainConfig(selectedChain.chainId);
      const rpcUrl = evmChainConfig?.rpcUrl;
      if (!rpcUrl) return null;
      try {
        const readProvider = new JsonRpcProvider(rpcUrl);
        if (walletClient?.account?.address && publicClient) {
          const provider = viemClientToEthersProvider(
            publicClient as Client<Transport, Chain>,
          ) as Provider;
          const signer = viemConnectorClientToEthersSigner(
            walletClient as Client<Transport, Chain, Account>,
          );
          return baseValue.mixerSdkInstance.getChain(
            `evm:${selectedChain.chainId}`,
            { signer, provider },
          ) as MixerContextValue["chainSDK"];
        }
        return baseValue.mixerSdkInstance.getChain(
          `evm:${selectedChain.chainId}`,
          { signer: null, provider: readProvider },
        ) as MixerContextValue["chainSDK"];
      } catch {
        return null;
      }
    }

    if (selectedChain.family === "solana") {
      if (!solanaConnection) return null;
      try {
        const wallet = solanaWallet ?? null;
        return baseValue.mixerSdkInstance.getChain(
          `solana:${selectedChain.network}`,
          {
            wallet: wallet as any,
            connection: solanaConnection,
          },
        ) as MixerContextValue["chainSDK"];
      } catch {
        return null;
      }
    }

    return null;
  }, [
    baseValue.mixerSdkInstance,
    baseValue.getEvmChainConfig,
    selectedChain,
    solanaWallet,
    solanaConnection,
    walletClient,
    publicClient,
  ]);
}
