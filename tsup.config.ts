import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm", "cjs"],
  dts: true,
  // Target browser behavior so esbuild/tsup doesn't inline node-only code paths.
  // This prevents runtime "dynamic usage of require is not supported" in Next client bundles.
  platform: "browser",
  clean: true,
  sourcemap: true,
  external: [
    // React ecosystem
    "react",
    "react-dom",
    "wagmi",
    "viem",
    "@tanstack/react-query",
    "ethers",
    // Do not bundle the core SDK and chain libs into the React package bundle.
    // Next.js will handle bundling/polyfilling for browser targets.
    "@aintivirus-ai/sdk-core",
    "@solana/web3.js",
    "@solana/spl-token",
    "@coral-xyz/anchor",
    "buffer",
    "bs58",
    "poseidon-lite",
  ],
});
