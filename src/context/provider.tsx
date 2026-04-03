"use client";
/**
 * MixerProvider – pass config and current selected chain (family + chainId or network). Initializes SDK and provides to consumers.
 * Wrap with WagmiProvider + QueryClientProvider (TanStack Query) for EVM — wagmi v3 requires both.
 */

import { useMemo } from "react";
import { MixerContext } from "./context";
import { createMixerContextValue } from "./create-value";
import { useChainSDK } from "./use-chain-sdk";
import type { MixerProviderProps } from "./types";

export function MixerProvider({
  config,
  selectedChain,
  solanaWallet,
  solanaConnection,
  wagmiConfig: wagmiConfigProp,
  children,
}: MixerProviderProps) {
  const baseValue = useMemo(
    () => createMixerContextValue(config, selectedChain),
    [config, selectedChain],
  );

  const chainSDK = useChainSDK(
    baseValue,
    selectedChain,
    solanaWallet,
    solanaConnection,
    wagmiConfigProp,
  );

  const value = useMemo(() => {
    return {
      ...baseValue,
      chainSDK,
      wagmiConfig: wagmiConfigProp,
    };
  }, [baseValue, chainSDK, wagmiConfigProp]);

  return (
    <MixerContext.Provider value={value}>{children}</MixerContext.Provider>
  );
}
