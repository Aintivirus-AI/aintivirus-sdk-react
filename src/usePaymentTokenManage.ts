"use client";

import { useCallback } from "react";
import type { TransactionResult } from "@aintivirus-ai/sdk-core";
import { useMixer } from "./context";

export interface UsePaymentTokenManageReturn {
  /**
   * Check if a token is allowed for payments.
   */
  isAllowedToken: (token: string) => Promise<boolean>;
  /**
   * Register or update allowed token.
   * Same shape across chains: (token, allowed) -> TransactionResult.
   */
  updateAllowedToken: (
    token: string,
    allowed: boolean,
  ) => Promise<TransactionResult>;

  /** True when read operations can run on the selected chain. */
  isReady: boolean;
}

export function usePaymentTokenManage(): UsePaymentTokenManageReturn {
  const mixer = useMixer();

  const chainSDK = mixer?.chainSDK ?? null;
  const selected = mixer?.selectedChain;

  const isReady = !!chainSDK && !!selected;

  const isAllowedToken = useCallback(
    async (token: string): Promise<boolean> => {
      if (!chainSDK) return false;
      return chainSDK.isAllowedToken(token);
    },
    [chainSDK],
  );

  const updateAllowedToken = useCallback(
    async (token: string, allowed: boolean): Promise<TransactionResult> => {
      if (!chainSDK) {
        throw new Error(
          "No active chain. Connect wallet on a supported chain.",
        );
      }
      return chainSDK.updateAllowedToken(token, allowed);
    },
    [chainSDK],
  );

  return {
    isAllowedToken,
    updateAllowedToken,
    isReady,
  };
}
