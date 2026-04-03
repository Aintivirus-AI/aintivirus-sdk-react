/**
 * Types for Mixer React context. Provider gets config + selected chain, initializes SDK, passes to consumers.
 */

import type { ReactNode } from "react";
import type {
  EvmChainConfig,
  AintiVirusEVM,
  AintiVirusSolana,
  NormalizedMixerConfig,
  SolanaChainConfig,
  MixerSDKInstance,
} from "@aintivirus-ai/sdk-core";
import type { MixerSDKConfig, SDKConfig } from "@aintivirus-ai/sdk-core";
import type { Wallet } from "@coral-xyz/anchor";
import type { Connection } from "@solana/web3.js";
import type { Config } from "wagmi";

/** Currently selected chain: pass to MixerProvider so context and hooks use it. */
export type SelectedChain =
  | { family: "evm"; chainId: number }
  | { family: "solana"; network: string };

export interface MixerContextValue {
  /** Normalized config (evm + solana chains). */
  config: NormalizedMixerConfig;
  /** Initialized mixer SDK. Use getChain(chainKey, context) for EVM/Solana clients. */
  mixerSdkInstance: MixerSDKInstance | undefined;
  /**
   * SDK instance bound to the currently selected chain.
   * UI can call chain-agnostic methods like `getDeployedMixers()` without
   * manually instantiating subgraph / Solana clients.
   */
  chainSDK: AintiVirusEVM | AintiVirusSolana | null;
  /** Current selected chain (from MixerProvider). Used by EVM / Solana hooks. */
  selectedChain: SelectedChain | undefined;
  /** Get EVM config for a chainId */
  getEvmChainConfig: (chainId: number) => EvmChainConfig | undefined;
  /** Get Solana config for a network */
  getSolanaChainConfig: (network: string) => SolanaChainConfig | undefined;
  evmChainIds: number[];
  solanaNetworks: string[];
  /**
   * When set, wagmi hooks use this config instead of WagmiContext (avoids WagmiProviderNotFoundError
   * when the config is injected explicitly). Optional if you already wrap with WagmiProvider.
   */
  wagmiConfig?: Config;
}

export interface MixerProviderProps {
  /** Settings config (full MixerSDKConfig or legacy SDKConfig). In production, pass settings JSON. */
  config: MixerSDKConfig | SDKConfig;
  /** Current selected chain (e.g. from your chain selector or wagmi useChainId). */
  selectedChain?: SelectedChain;
  /** Anchor-compatible wallet object used for Solana chainSDK init. */
  solanaWallet?: Wallet;
  /** Solana RPC connection used for Solana chainSDK init. */
  solanaConnection?: Connection;
  /** Same instance passed to `WagmiProvider config={…}` — recommended so EVM hooks work without relying on context alone. */
  wagmiConfig?: Config;
  children: ReactNode;
}

export type UseMixerConfigReturn = NormalizedMixerConfig & {
  getEvmChainConfig: (chainId: number) => EvmChainConfig | undefined;
  getSolanaChainConfig: (network: string) => SolanaChainConfig | undefined;
  evmChainIds: number[];
  solanaNetworks: string[];
};
