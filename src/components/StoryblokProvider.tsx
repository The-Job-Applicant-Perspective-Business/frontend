'use client';

import React from 'react';
import { storyblokInit, apiPlugin } from '@storyblok/react';
import { HeroSection } from '@/components/layout/HeroSection';
import { TabbedInterface } from '@/components/layout/TabbedInterface';
import { LocalJobsGrid } from '@/components/layout/LocalJobsGrid';
import { MissionBanner } from '@/components/layout/MissionBanner';
import { BlogGrid } from '@/components/layout/BlogGrid';
import { PageBlok } from '@/components/storyblok/PageBlok';

// Component registry mapping Storyblok technical slugs to tokenized primitives
const components = {
  page: PageBlok,
  hero_section: HeroSection,
  tabbed_interface: TabbedInterface,
  local_jobs_grid: LocalJobsGrid,
  mission_banner: MissionBanner,
  blog_grid: BlogGrid,
};

storyblokInit({
  accessToken: process.env.NEXT_PUBLIC_STORYBLOK_ACCESS_TOKEN,
  use: [apiPlugin],
  components,
});

interface StoryblokProviderProps {
  children: React.ReactNode;
}

export const StoryblokProvider = ({ children }: StoryblokProviderProps) => {
  return <>{children}</>;
};
