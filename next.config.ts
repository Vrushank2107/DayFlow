import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  // Skip static generation for API routes during build
  experimental: {
    serverComponentsExternalPackages: ['better-sqlite3'],
  },
};

export default nextConfig;
