/**
 * Hook for paying orders (EVM + Solana).
 * Uses `chainSDK` from MixerProvider only — sdk-core decides gateway vs contract / SOL vs SPL.
 */

import { useCallback, useState } from "react";
import type { TransactionResult } from "@aintivirus-ai/sdk-core";
import { useMixer } from "./context";

const ERR_NO_CHAIN =
  "No active chain. Connect wallet on a supported chain (from config).";

export interface UsePaymentReturn {
  /**
   * Chain-agnostic payment method.
   * - EVM: token can be ERC20; pass chain WETH to pay via gateway.
   * - Solana: token is SPL mint; pass wSOL mint to pay via native SOL.
   */
  payOrder: (
    orderId: string,
    tokenOrMint: string,
    buyer: string,
    amount: bigint,
  ) => Promise<TransactionResult>;

  isReady: boolean;
  isPaying: boolean;
}

export function usePayment(): UsePaymentReturn {
  const mixer = useMixer();
  const sdk = mixer?.chainSDK ?? null;
  const isReady = !!sdk;
  const [isPaying, setIsPaying] = useState(false);

  const payOrder = useCallback(
    async (
      orderId: string,
      tokenOrMint: string,
      buyer: string,
      amount: bigint,
    ): Promise<TransactionResult> => {
      if (!sdk) throw new Error(ERR_NO_CHAIN);
      setIsPaying(true);
      try {
        return await sdk.payOrder(orderId, tokenOrMint, buyer, amount);
      } finally {
        setIsPaying(false);
      }
    },
    [sdk],
  );

  return {
    payOrder,

    isReady,
    isPaying,
  };
}
