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
    const devHrAliases =
      process.env.NODE_ENV === 'development'
        ? [
            {
              source: '/login',
              destination: '/hr/login',
            },
            {
              source: '/create-account',
              destination: '/hr/create-account',
            },
            {
              source: '/verify',
              destination: '/hr/verify',
            },
          ]
        : [];

    return [
      ...devHrAliases,
      // Rule SEO-01: Canonical About page
      {
        source: '/who-we-are',
        destination: '/about-us',
      },
      // Rule SEO-02: Insights directory aggregator
      {
        source: '/job-insights',
        destination: '/blog-listing',
      },
      {
        source: '/job-insights/:slug',
        destination: '/blog/:slug',
      },
      // Rule SEO-03: Government financial support & emergency aid
      {
        source: '/us-govt-financial-support',
        destination: '/financial-support',
      },
      // Rule SEO-04: Self-care and burnout resources
      {
        source: '/self-care-tools',
        destination: '/self-care',
      },
    ];
  },
};

export default nextConfig;
