import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  distDir: "out",
  basePath: "/portfolio",
  assetPrefix: "/portfolio/",
  images: { unoptimized: true },
  trailingSlash: true,

  // No build workarounds here, and two have already been tried and removed —
  // a sha256 hashFunction and webpackBuildWorker: false. Neither helped,
  // because the intermittent "hasher fed undefined content" crashes are not
  // the toolchain's: they track WHERE the repo sits. This checkout lives in
  // ~/Documents, which macOS syncs to iCloud, and files evicted mid-read
  // during a build produce exactly these symptoms. Same tree, same Node,
  // cloned to /tmp: three clean builds out of three. In place: pass/fail at
  // random across two Node majors, a fresh npm ci, and both worker modes.
  // If builds flake here again, judge the code from a clone outside the
  // synced folder — or move the checkout out of ~/Documents.
};

export default nextConfig;
