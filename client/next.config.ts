import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // "standalone" output bundles everything needed to run Next.js into a single
  // self-contained directory (.next/standalone). This is the recommended way
  // to deploy Next.js in Docker — no need to copy all of node_modules.
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "img.clerk.com",
      },
    ],
  },
};

export default nextConfig;
