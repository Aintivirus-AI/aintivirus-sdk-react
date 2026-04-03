# @aintivirus-ai/sdk-react

React hooks and context for AintiVirus Mixer SDK. Depends on **@aintivirus-ai/sdk-core**.

## Usage

Wrap with **WagmiProvider** + **QueryClientProvider**, then **MixerProvider**. Pass the **same** `config` object to both `WagmiProvider` and `MixerProvider`’s `wagmiConfig` prop so hooks never hit `WagmiProviderNotFoundError` (wagmi’s `useConfig({ config })` works without relying on context alone):

```tsx
import { MixerProvider, useMixerConfig, useDeposit } from "@aintivirus-ai/sdk-react";
import { wagmiConfig } from "./wagmi"; // your createConfig result

<MixerProvider config={…} wagmiConfig={wagmiConfig} selectedChain={…}>
  …
</MixerProvider>
```

`useDeposit` reads `chainSDK` from context; withdraw/admin hooks reuse the same EVM instance and use wagmi only for connection / connector checks (`canTransactEvm`).

## Exports

- **Provider:** `MixerProvider`
- **Hooks:** `useMixerConfig`, `useMixer`, `useDeploy`, `useDeposit`, `useWithdraw`, `usePayment`
- **Re-exports from core:** `AintiVirusEVMSubgraph`, `MixerPool`, `DepositEntity`, `TokenUpdatedEntity`, etc.

## Build

```bash
pnpm build
```

Ensure **@aintivirus-ai/sdk-core** is built first (or use root `pnpm build:packages`).
