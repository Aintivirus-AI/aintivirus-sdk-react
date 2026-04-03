/**
 * React hooks for AintiVirus Mixer SDK. Use MixerProvider with config; hooks read SDK and config from context.
 * For EVM hooks (useDeposit, useWithdraw, etc.) wrap the app with WagmiProvider so hooks can resolve the signer.
 */

export { MixerProvider, useMixerConfig, useMixer } from "./context";
export type { MixerContextValue, SelectedChain } from "./context";
// export type { SolanaConnectionOptions } from "./context"; // Reserved for future Solana

export { useDeploy, useDeployMixer } from "./useDeploy";
export type {
  UseDeployReturn,
  UseDeployMixerReturn,
  DeployMixerResult,
} from "./useDeploy";

export { useDeposit } from "./useDeposit";
export type {
  UseDepositReturn,
  DepositResult,
  SolanaConnectionOptions,
} from "./useDeposit";

export { useWithdraw } from "./useWithdraw";
export type { UseWithdrawReturn, WithdrawParams } from "./useWithdraw";

export { useStake } from "./useStake";
export type { UseStakeReturn } from "./useStake";

export { usePaymentTokenManage } from "./usePaymentTokenManage";
export type { UsePaymentTokenManageReturn } from "./usePaymentTokenManage";

export { usePayment } from "./usePayment";
export type { UsePaymentReturn } from "./usePayment";

export {
  ChainType,
  AintiVirusEVM,
  AintiVirusEVMSubgraph,
  AintiVirusSolanaQueryService,
  computeCommitment,
  generateSecretAndNullifier,
  feeBpsToPercentString,
} from "@aintivirus-ai/sdk-core";
export type {
  DepositData,
  TransactionResult,
  EvmChainConfig,
  EVMHookConfig,
  MixerPool,
  MixerPoolDetailed,
  DepositEntity,
  TokenUpdatedEntity,
  DeployedMixer,
  MixerPoolDepositStatsFilter,
  MixerPoolDepositStatsResult,
} from "@aintivirus-ai/sdk-core";
export type { SolanaHookConfig } from "@aintivirus-ai/sdk-core"; // Solana integration disabled

/** Wagmi ↔ ethers helpers (sdk-core EVM remains ethers-based). @see https://wagmi.sh/react/guides/ethers */
export {
  viemClientToEthersProvider,
  viemConnectorClientToEthersSigner,
} from "./wagmi-ethers-adapters";
