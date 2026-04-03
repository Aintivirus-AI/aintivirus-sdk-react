/**
 * Hook for deploying mixers (EVM + Solana).
 * Uses `chainSDK` from MixerProvider only — same call shape for every chain.
 */

import { useCallback, useState } from "react";
import { useMixer } from "./context";
import type { TransactionResult } from "@aintivirus-ai/sdk-core";

const ERR_NO_CHAIN =
  "No active chain. Connect wallet on a supported chain (from config).";

export interface DeployMixerResult extends TransactionResult {
  /** EVM mixer contract address or Solana mixer PDA. */
  mixerAddress: string;
}

export interface UseDeployMixerReturn {
  /** Deploy mixer on the currently selected chain using shared input/output. */
  deployMixer: (
    assetAddress: string,
    amount: bigint,
  ) => Promise<DeployMixerResult>;
  isReady: boolean;
  isDeploying: boolean;
}

/**
 * Chain-agnostic deploy hook. Must be used inside MixerProvider.
 * EVM writes still require an EVM signer; Solana writes require Solana wallet + connection in provider.
 */
export function useDeployMixer(): UseDeployMixerReturn {
  const mixer = useMixer();
  const sdk = mixer?.chainSDK ?? null;
  const isReady = !!sdk;
  const [isDeploying, setIsDeploying] = useState(false);

  const deployMixer = useCallback(
    async (
      assetAddress: string,
      amount: bigint,
    ): Promise<DeployMixerResult> => {
      if (!sdk) throw new Error(ERR_NO_CHAIN);
      setIsDeploying(true);
      try {
        const result = await sdk.deployMixer(assetAddress, amount);
        return {
          ...result,
          mixerAddress:
            typeof result.mixerAddress === "string" ? result.mixerAddress : "",
        };
      } finally {
        setIsDeploying(false);
      }
    },
    [sdk],
  );

  return {
    deployMixer,
    isReady,
    isDeploying,
  };
}

/** Backward-compatible alias. */
export const useDeploy = useDeployMixer;
export type UseDeployReturn = UseDeployMixerReturn;
