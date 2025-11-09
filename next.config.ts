import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    resolveAlias: {
      '@mediapipe/pose': './lib/empty/mediapipe-stub.js',
    },
  },
  serverExternalPackages: ['@tensorflow/tfjs', '@tensorflow-models/pose-detection'],
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
      };
      config.resolve.alias = {
        ...config.resolve.alias,
        '@mediapipe/pose': './lib/empty/mediapipe-stub.js',
      };
    }
    return config;
  },
};

export default nextConfig;
