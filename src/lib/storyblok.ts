import { apiPlugin, storyblokInit } from '@storyblok/react/rsc';
import { PageBlok } from '@/components/storyblok/PageBlok';
import { HeroSection } from '@/components/layout/HeroSection';
import { TabbedInterface } from '@/components/layout/TabbedInterface';
import { LocalJobsGrid } from '@/components/layout/LocalJobsGrid';
import { MissionBanner } from '@/components/layout/MissionBanner';
import { BlogGrid } from '@/components/layout/BlogGrid';

// 1. Server-Side Component Registry for @storyblok/react/rsc
export const components = {
  page: PageBlok,
  hero_section: HeroSection,
  tabbed_interface: TabbedInterface,
  local_jobs_grid: LocalJobsGrid,
  mission_banner: MissionBanner,
  blog_grid: BlogGrid,
};

// 2. Resolve authentication credentials across server and client environment variables
const accessToken =
  process.env.STORYBLOK_DELIVERY_API_TOKEN || process.env.NEXT_PUBLIC_STORYBLOK_TOKEN || '';

// 3. Match Storyblok Space Location: 'us' for North America, 'eu' for Europe
const region = (process.env.STORYBLOK_REGION as 'us' | 'eu') || 'us';

export const getStoryblokApi = storyblokInit({
  accessToken,
  use: [apiPlugin],
  apiOptions: {
    region,
  },
  components,
});

// 4. Safe re-export for consumers invoking initStoryblok() before getStoryblokApi()
export const initStoryblok = () => {
  return getStoryblokApi;
};
