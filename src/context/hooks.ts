"use client";
/**
 * Hooks that read from MixerContext.
 */

import { useContext } from "react";
import type { MixerContextValue, UseMixerConfigReturn } from "./types";
import { MixerContext } from "./context";

const EMPTY_CONFIG: UseMixerConfigReturn = {
  chains: { evm: {}, solana: {} },
  getEvmChainConfig: () => undefined,
  getSolanaChainConfig: () => undefined,
  evmChainIds: [],
  solanaNetworks: [],
};

export function useMixerConfig(): UseMixerConfigReturn {
  const ctx = useContext(MixerContext);
  if (!ctx) return EMPTY_CONFIG;
  return {
    ...ctx.config,
    getEvmChainConfig: ctx.getEvmChainConfig,
    getSolanaChainConfig: ctx.getSolanaChainConfig,
    evmChainIds: ctx.evmChainIds,
    solanaNetworks: ctx.solanaNetworks,
  };
}

export function useMixer(): MixerContextValue | null {
  return useContext(MixerContext);
}
