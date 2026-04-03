/**
 * Hook for withdrawing from mixers (EVM + Solana).
 * EVM: fetches pool deposits from subgraph, builds merkle tree and proof, submits withdraw tx.
 * Solana: fetches commitments on-chain, builds proof (recipient = Poseidon of pubkey), submits withdraw.
 * Must be used inside MixerProvider (WagmiProvider for EVM signer; Solana wallet + connection on provider).
 */

import { useCallback, useState } from "react";
import type { TransactionResult } from "@aintivirus-ai/sdk-core";

import { useMixer } from "./context";

export interface WithdrawParams {
  /** Asset address (EVM hex address or Solana mint base58 string). */
  asset: string;
  /** Pool amount (smallest unit). */
  amount: bigint;
  secret: bigint;
  nullifier: bigint;
  recipient: string;
  /** Withdrawal fee (default BigInt(0)). EVM only; must match circuit proof. */
  fee?: bigint;
  /** Relayer address (default zero address). EVM only; must match circuit proof. */
  relayer?: string;
}

export interface UseWithdrawReturn {
  /**
   * Withdraw from the given pool using secret/nullifier from deposit data.
   * Returns a chain-native tx id / hash.
   */
  withdraw: (params: WithdrawParams) => Promise<TransactionResult>;
  isReady: boolean;
  /** True while a withdraw transaction is being prepared/submitted. */
  isWithdrawing: boolean;
}

const ERR_NO_CHAIN =
  "No active chain. Connect wallet on a supported chain (from config).";
/**
 * Withdraw hook. Must be used inside MixerProvider (and WagmiProvider for EVM).
 */
export function useWithdraw(): UseWithdrawReturn {
  const mixer = useMixer();
  const sdk = mixer?.chainSDK ?? null;
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  const selected = mixer?.selectedChain;
  const isReady = !!sdk;

  const withdraw = useCallback(
    async (params: WithdrawParams): Promise<TransactionResult> => {
      const { asset, amount, secret, nullifier, recipient } = params;

      if (!selected) {
        throw new Error(ERR_NO_CHAIN);
      }

      if (!sdk) {
        throw new Error(ERR_NO_CHAIN);
      }

      setIsWithdrawing(true);
      try {
        return sdk.withdrawWithCredentials(
          asset,
          amount,
          secret,
          nullifier,
          recipient,
          params.fee,
          params.relayer,
        );
      } finally {
        setIsWithdrawing(false);
      }
    },
    [selected, sdk],
  );

  return {
    withdraw,
    isReady,
    isWithdrawing,
  };
}
