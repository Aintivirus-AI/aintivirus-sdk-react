/**
 * Hook for staking operations (EVM + Solana).
 * Uses `chainSDK` from MixerProvider; SDK handles chain-specific transaction flow.
 */

import { useCallback, useState } from "react";
import {
  AintiVirusEVM,
  AintiVirusSolana,
  type TransactionResult,
} from "@aintivirus-ai/sdk-core";
import { useMixer } from "./context";

const ERR_NO_CHAIN =
  "No active chain. Connect wallet on a supported chain (from config).";

export interface UseStakeReturn {
  stake: (assetAddress: string, amount: bigint) => Promise<TransactionResult>;
  unstake: (assetAddress: string) => Promise<TransactionResult>;
  claim: (assetAddress: string, seasonId: bigint) => Promise<TransactionResult>;
  isReady: boolean;
  isStaking: boolean;
  isUnstaking: boolean;
  isClaiming: boolean;
}

export function useStake(): UseStakeReturn {
  const mixer = useMixer();
  const sdk = mixer?.chainSDK ?? null;
  const [isStaking, setIsStaking] = useState(false);
  const [isUnstaking, setIsUnstaking] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);

  const isReady = !!sdk;

  const getReadySdk = useCallback((): AintiVirusEVM | AintiVirusSolana => {
    if (!sdk) {
      throw new Error(ERR_NO_CHAIN);
    }
    return sdk;
  }, [sdk]);

  const stake = useCallback(
    async (
      assetAddress: string,
      amount: bigint,
    ): Promise<TransactionResult> => {
      const activeSdk = getReadySdk();
      setIsStaking(true);
      try {
        return await activeSdk.stake(assetAddress, amount);
      } finally {
        setIsStaking(false);
      }
    },
    [getReadySdk],
  );

  const unstake = useCallback(
    async (assetAddress: string): Promise<TransactionResult> => {
      const activeSdk = getReadySdk();
      setIsUnstaking(true);
      try {
        return await activeSdk.unstake(assetAddress);
      } finally {
        setIsUnstaking(false);
      }
    },
    [getReadySdk],
  );

  const claim = useCallback(
    async (
      assetAddress: string,
      seasonId: bigint,
    ): Promise<TransactionResult> => {
      const activeSdk = getReadySdk();
      setIsClaiming(true);
      try {
        return await activeSdk.claim(assetAddress, seasonId);
      } finally {
        setIsClaiming(false);
      }
    },
    [getReadySdk],
  );

  return {
    stake,
    unstake,
    claim,
    isReady,
    isStaking,
    isUnstaking,
    isClaiming,
  };
}
