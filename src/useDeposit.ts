/**
 * Hook for depositing into mixers (EVM + Solana).
 * Uses `chainSDK` from MixerProvider only — same call shape for every chain; SDK handles chain-specific types.
 * Must be used inside MixerProvider (and WagmiProvider for EVM signer when depositing).
 */

import { useCallback, useState } from "react";
import {
  type TransactionResult,
  type DepositData,
  generateSecretAndNullifier,
  computeCommitment,
} from "@aintivirus-ai/sdk-core";

import { useMixer } from "./context";

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
const ERR_NO_MIXER =
  "No mixer deployed for this asset and amount. Deploy a mixer first (Deploy tab).";
const ERR_NO_CHAIN =
  "No active chain. Connect wallet on a supported chain (from config).";

/** Partner arg for both chains: unset / zero address → omitted (EVM default zero, Solana no partner). */
function optionalPartnerArg(partnerAddress?: string): string | undefined {
  const p = partnerAddress?.trim();
  if (!p) return undefined;
  const lower = p.toLowerCase();
  if (lower === ZERO_ADDRESS) return undefined;
  return p;
}

export interface DepositResult extends TransactionResult {
  /** Save this (secret, nullifier) to generate withdrawal proof later. */
  depositData: DepositData;
}

/** @deprecated No longer needed – pass solanaWallet + solanaConnection to MixerProvider instead. */
export interface SolanaConnectionOptions {
  solanaWallet: import("@coral-xyz/anchor").Wallet;
  solanaConnection: import("@solana/web3.js").Connection;
}

export interface UseDepositReturn {
  /**
   * Deposit into the mixer for the given asset and amount.
   * Commitment is generated automatically. Returns depositData for later withdrawal.
   * Fails if no mixer is deployed for this asset+amount.
   * @param partnerAddress Optional white-label partner address for extra fee; use zero or omit for none.
   */
  deposit: (
    assetAddress: string,
    amount: bigint,
    partnerAddress?: string,
  ) => Promise<DepositResult>;
  /** Total to pay (amount + protocol fee + partner fee). Use for display or approval. */
  calculateDepositAmount: (
    amount: bigint,
    partnerAddress?: string,
  ) => Promise<bigint>;
  /** Check if a mixer is deployed for this asset and amount. */
  mixerExists: (assetAddress: string, amount: bigint) => Promise<boolean>;
  /**
   * Protocol service fee in basis points (100 bps = 1%). Same on-chain source as deposit fee calculation.
   */
  getFeeRate: () => Promise<bigint>;
  /** `chainSDK` is initialized for the selected chain (read-only RPC is enough for checks; EVM deposit still needs a connected wallet). */
  isReady: boolean;
  /** True while a deposit transaction is being prepared/submitted. */
  isDepositing: boolean;
}

/**
 * Deposit hook. Must be used inside MixerProvider (and WagmiProvider for EVM).
 */
export function useDeposit(): UseDepositReturn {
  const mixer = useMixer();
  const sdk = mixer?.chainSDK ?? null;
  const isReady = !!sdk;
  const [isDepositing, setIsDepositing] = useState(false);

  const mixerExists = useCallback(
    async (assetAddress: string, amount: bigint): Promise<boolean> => {
      if (!sdk) return false;
      return sdk.mixerExists(assetAddress, amount);
    },
    [sdk],
  );

  const deposit = useCallback(
    async (
      assetAddress: string,
      amount: bigint,
      partnerAddress?: string,
    ): Promise<DepositResult> => {
      if (!sdk) throw new Error(ERR_NO_CHAIN);

      setIsDepositing(true);
      try {
        const exists = await sdk.mixerExists(assetAddress, amount);
        if (!exists) throw new Error(ERR_NO_MIXER);

        const { secret, nullifier } = generateSecretAndNullifier();
        const commitment = computeCommitment(secret, nullifier);
        const partner = optionalPartnerArg(partnerAddress);

        const result = await sdk.deposit(
          assetAddress,
          amount,
          commitment,
          partner,
        );

        return {
          ...result,
          depositData: {
            secret,
            nullifier,
            commitment,
            amount,
            assetAddress,
          },
        };
      } finally {
        setIsDepositing(false);
      }
    },
    [sdk],
  );

  const calculateDepositAmount = useCallback(
    async (amount: bigint, partnerAddress?: string): Promise<bigint> => {
      if (!sdk) throw new Error(ERR_NO_CHAIN);
      const partner = optionalPartnerArg(partnerAddress);
      return sdk.calculateDepositAmount(amount, partner);
    },
    [sdk],
  );

  const getFeeRate = useCallback(async (): Promise<bigint> => {
    if (!sdk) throw new Error(ERR_NO_CHAIN);
    return sdk.getFeeRate();
  }, [sdk]);

  return {
    deposit,
    calculateDepositAmount,
    mixerExists,
    getFeeRate,
    isReady,
    isDepositing,
  };
}
