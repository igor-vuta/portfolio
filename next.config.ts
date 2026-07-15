import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  distDir: "out",
  basePath: "/portfolio",
  assetPrefix: "/portfolio/",
  images: { unoptimized: true },
  trailingSlash: true,
};

export default nextConfig;
