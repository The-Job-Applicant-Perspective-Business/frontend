import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'a.storyblok.com',
        pathname: '/**',
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/who-we-are',
        destination: '/about-us',
      },
      {
        source: '/job-insights',
        destination: '/blog-listing',
      },
    ];
  },
};

export default nextConfig;
