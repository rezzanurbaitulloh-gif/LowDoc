const withPWA = require("@ducanh2912/next-pwa").default({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
  runtimeCaching: [
    {
      urlPattern: /^https?:\/\/.*\.(?:png|jpg|jpeg|svg|gif|webp)/i,
      handler: "CacheFirst",
      options: {
        cacheName: "static-assets",
        expiration: { maxEntries: 64, maxAgeSeconds: 30 * 24 * 60 * 60 },
      },
    },
  ],
  workboxOptions: {
    maximumFileSizeToCacheInBytes: 6 * 1024 * 1024,
  },
});

/** @type {import('next').NextConfig} */
const nextConfig = withPWA({
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  webpack: (config) => {
    config.module = config.module || {};
    config.module.rules = config.module.rules || [];
    config.module.rules.push({
      test: /\.wasm$/,
      type: "asset/resource",
      generator: {
        filename: "static/wasm/[name]-[hash][ext]",
      },
    });
    return config;
  },
});

module.exports = nextConfig;