/**
 * Create MixerContextValue from config: normalize config, initialize SDK, return value for consumers.
 */

import {
  normalizeConfig,
  getEvmChainConfig,
  getSolanaChainConfig,
  getEvmChainIds,
  getSolanaNetworks,
  createMixerSDK,
} from "@aintivirus-ai/sdk-core";
import type { MixerSDKConfig, SDKConfig, MixerSDKInstance } from "@aintivirus-ai/sdk-core";
import type { MixerContextValue, SelectedChain } from "./types";

export function createMixerContextValue(
  config: MixerSDKConfig | SDKConfig,
  selectedChain?: SelectedChain,
): MixerContextValue {
  const normalized = normalizeConfig(config);
  const hasEvm = Object.keys(normalized.chains?.evm ?? {}).length > 0;
  const hasSolana = Object.keys(normalized.chains?.solana ?? {}).length > 0;
  const mixerSdkInstance: MixerSDKInstance | undefined =
    hasEvm || hasSolana ? createMixerSDK(config) : undefined;
  return {
    config: normalized,
    mixerSdkInstance,
    chainSDK: null,
    selectedChain,
    getEvmChainConfig: (chainId: number) =>
      getEvmChainConfig(normalized, chainId),
    getSolanaChainConfig: (network: string) =>
      getSolanaChainConfig(normalized, network),
    evmChainIds: getEvmChainIds(normalized),
    solanaNetworks: getSolanaNetworks(normalized),
  };
}
