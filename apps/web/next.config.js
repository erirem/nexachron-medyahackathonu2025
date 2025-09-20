/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable standalone for now to fix deployment
  // output: "standalone",
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || "https://nexachron-api.onrender.com",
  },
};

module.exports = nextConfig;