// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {},
  },
  eslint: {
    // don’t fail the production build on ESLint errors
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;
