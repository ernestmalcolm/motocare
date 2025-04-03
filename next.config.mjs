/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    serverActions: true,
  },
  output: "standalone",
  webpack: (config, { isServer }) => {
    return config;
  },
};

export default nextConfig;
