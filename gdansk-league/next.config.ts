import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ddragon.leagueoflegends.com',
      },
      {
        protocol: 'https',
        hostname: 'flagcdn.com',
      },
      {
        protocol: 'https',
        hostname: 'raw.communitydragon.org',
      },
      {
        protocol: 'https',
        hostname: 'opgg-static.akamaized.net',
      },
      {
        protocol: 'https',
        hostname: 'cdn3.emoji.gg',
      },
      {
        protocol: 'https',
        hostname: 'static.wikia.nocookie.net',
      },
    ],
  },
};

export default nextConfig;
