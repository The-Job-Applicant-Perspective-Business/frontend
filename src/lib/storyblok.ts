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
