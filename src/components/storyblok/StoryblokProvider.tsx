'use client';

import React from 'react';
import { storyblokInit, apiPlugin } from '@storyblok/react';
import { PageBlok } from '@/components/storyblok/PageBlok';
import {
  HeroSection,
  TabbedInterface,
  LocalJobsGrid,
  MissionBanner,
  PromoBanner,
  BlogGrid,
} from '@/components/blocks';

/**
 * Component registry binding Storyblok schema technical names
 * to refactored React Server and Client presentational blocks.
 */
const components = {
  page: PageBlok,
  'Home Content': PageBlok,
  home_content: PageBlok,
  hero_section: HeroSection,
  tabbed_interface: TabbedInterface,
  local_jobs_grid: LocalJobsGrid,
  mission_banner: MissionBanner,
  promo_banner: PromoBanner,
  blog_grid: BlogGrid,
};

// Evaluate public access tokens from environment
const clientAccessToken =
  process.env.NEXT_PUBLIC_STORYBLOK_TOKEN || process.env.NEXT_PUBLIC_STORYBLOK_ACCESS_TOKEN || '';

const clientRegion = (process.env.NEXT_PUBLIC_STORYBLOK_REGION as 'us' | 'eu') || 'eu';

// Initialize the client SDK only if a token is configured
if (clientAccessToken) {
  storyblokInit({
    accessToken: clientAccessToken,
    use: [apiPlugin],
    apiOptions: {
      region: clientRegion,
    },
    components,
    enableFallbackComponent: process.env.NODE_ENV !== 'production',
  });
} else if (process.env.NODE_ENV !== 'production') {
  console.warn(
    'StoryblokProvider: NEXT_PUBLIC_STORYBLOK_TOKEN is missing. Client bridge initialization skipped.',
  );
}

interface StoryblokProviderProps {
  children: React.ReactNode;
}

export const StoryblokProvider = ({ children }: StoryblokProviderProps) => {
  return <>{children}</>;
};

export default StoryblokProvider;
