import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  distDir: "out",
  basePath: "/portfolio",
  assetPrefix: "/portfolio/",
  images: { unoptimized: true },
  trailingSlash: true,

  // The build crashes intermittently in Next's out-of-process webpack worker:
  // something hands the hasher undefined module content, the worker dies with
  // no usable stack, and identical clean-tree builds pass or fail at random —
  // a race, not a code problem (reproduced across two Node majors and a fresh
  // npm ci; an earlier sha256 hashFunction "fix" here only changed the error
  // message and its one green build was a coincidence). In-process webpack
  // takes the racing IPC layer out entirely. Build time cost is negligible on
  // a site this size.
  experimental: { webpackBuildWorker: false },
};

export default nextConfig;
