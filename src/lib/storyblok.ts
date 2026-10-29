import { apiPlugin, storyblokInit } from '@storyblok/react/rsc';
import { PageBlok } from '@/components/storyblok/PageBlok';
import {
  HeroSection,
  TabbedInterface,
  LocalJobsGrid,
  MissionBanner,
  BlogGrid,
  PromoBanner,
} from '@/components/blocks';

export const components = {
  page: PageBlok,
  'Home Content': PageBlok,
  home_content: PageBlok,
  hero_section: HeroSection,
  tabbed_interface: TabbedInterface,
  local_jobs_grid: LocalJobsGrid,
  mission_banner: MissionBanner,
  blog_grid: BlogGrid,
  promo_banner: PromoBanner,
};

const getStoryblokToken = (): string => {
  return (
    process.env.STORYBLOK_DELIVERY_API_TOKEN ||
    process.env.STORYBLOK_ACCESS_TOKEN ||
    process.env.STORYBLOK_TOKEN ||
    process.env.NEXT_PUBLIC_STORYBLOK_TOKEN ||
    process.env.NEXT_PUBLIC_STORYBLOK_ACCESS_TOKEN ||
    ''
  );
};

const getStoryblokRegion = (): 'us' | 'eu' => {
  return (
    (process.env.STORYBLOK_REGION as 'us' | 'eu') ||
    (process.env.NEXT_PUBLIC_STORYBLOK_REGION as 'us' | 'eu') ||
    'eu'
  );
};

/**
 * Pure server-side configuration check. Returns a diagnostic string (never a
 * token value) when configuration is unusable, or null when it looks present.
 * Presence is not validity: a rejected token still surfaces as an API error.
 * Reporting is left to the caller so this module stays free of handler coupling
 * and the route remains the single logging boundary.
 */
export const getStoryblokConfigIssue = (): string | null => {
  const token = getStoryblokToken();

  if (!token) {
    return 'Missing Storyblok access token in environment variables (checked STORYBLOK_DELIVERY_API_TOKEN, STORYBLOK_ACCESS_TOKEN, STORYBLOK_TOKEN, NEXT_PUBLIC_STORYBLOK_TOKEN, NEXT_PUBLIC_STORYBLOK_ACCESS_TOKEN).';
  }

  return null;
};

export const getStoryblokApi = storyblokInit({
  accessToken: getStoryblokToken(),
  use: [apiPlugin],
  apiOptions: {
    region: getStoryblokRegion(),
  },
  components,
});

export const initStoryblok = (): typeof getStoryblokApi => {
  return getStoryblokApi;
};
