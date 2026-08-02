import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  distDir: "out",
  basePath: "/portfolio",
  assetPrefix: "/portfolio/",
  images: { unoptimized: true },
  trailingSlash: true,

  // Node 25.6.1 crashes webpack's default wasm hasher (xxhash64) mid-build:
  // TypeError in WasmHash._updateWithBuffer, reproducible on a clean tree at
  // any commit. sha256 routes hashing through node:crypto instead of the
  // wasm path. Slightly slower, deterministic output, and it builds. Remove
  // once a Node or Next upgrade makes the default hasher survive again.
  webpack: (config) => {
    config.output.hashFunction = "sha256";
    return config;
  },
};

export default nextConfig;
