import { apiPlugin, storyblokInit } from '@storyblok/react/rsc';
import { PageBlok } from '@/components/storyblok/PageBlok';
import { HeroSection } from '@/components/layout/HeroSection';
import { TabbedInterface } from '@/components/layout/TabbedInterface';
import { LocalJobsGrid } from '@/components/layout/LocalJobsGrid';
import { MissionBanner } from '@/components/layout/MissionBanner';
import { BlogGrid } from '@/components/layout/BlogGrid';
import { PromoBanner } from '@/components/blocks/PromoBanner';

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

const accessToken =
  process.env.STORYBLOK_DELIVERY_API_TOKEN ||
  process.env.NEXT_PUBLIC_STORYBLOK_TOKEN ||
  process.env.NEXT_PUBLIC_STORYBLOK_ACCESS_TOKEN ||
  '';

const region =
  (process.env.STORYBLOK_REGION as 'us' | 'eu') ||
  (process.env.NEXT_PUBLIC_STORYBLOK_REGION as 'us' | 'eu') ||
  'eu';

export const getStoryblokApi = storyblokInit({
  accessToken,
  use: [apiPlugin],
  apiOptions: {
    region,
  },
  components,
});

export const initStoryblok = () => {
  return getStoryblokApi;
};
