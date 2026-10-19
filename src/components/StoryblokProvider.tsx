'use client';

import React from 'react';
import { storyblokInit, apiPlugin } from '@storyblok/react/rsc';
import { PageBlok } from '@/components/storyblok/PageBlok';
import { HeroSection } from '@/components/layout/HeroSection';
import { TabbedInterface } from '@/components/layout/TabbedInterface';
import { LocalJobsGrid } from '@/components/layout/LocalJobsGrid';
import { MissionBanner } from '@/components/layout/MissionBanner';
import { BlogGrid } from '@/components/layout/BlogGrid';

const components = {
  page: PageBlok,
  'Home Content': PageBlok,
  home_content: PageBlok,
  hero_section: HeroSection,
  tabbed_interface: TabbedInterface,
  local_jobs_grid: LocalJobsGrid,
  mission_banner: MissionBanner,
  blog_grid: BlogGrid,
};

// Check both naming conventions exposed to client bundle
const clientAccessToken =
  process.env.NEXT_PUBLIC_STORYBLOK_TOKEN || process.env.NEXT_PUBLIC_STORYBLOK_ACCESS_TOKEN || '';

const clientRegion = (process.env.NEXT_PUBLIC_STORYBLOK_REGION as 'us' | 'eu') || 'eu';

storyblokInit({
  accessToken: clientAccessToken,
  use: [apiPlugin],
  apiOptions: {
    region: clientRegion,
  },
  components,
});

interface StoryblokProviderProps {
  children: React.ReactNode;
}

const StoryblokProvider = ({ children }: StoryblokProviderProps) => {
  return <>{children}</>;
};

export default StoryblokProvider;
