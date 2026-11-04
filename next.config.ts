import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    // Allows Next.js to safely render images hosted on Storyblok's CDN
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'a.storyblok.com',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
