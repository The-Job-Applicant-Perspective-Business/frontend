import React from 'react';
import { storyblokEditable, StoryblokComponent } from '@storyblok/react';
import type { SbBlokData } from '@storyblok/react';
import {
  HeroSection,
  TabbedInterface,
  PromoBanner,
  LocalJobsGrid,
  MissionBanner,
  BlogGrid,
} from '@/components/blocks';

// Component registry map for Storyblok dynamic resolution
export const components = {
  hero_section: HeroSection,
  tabbed_interface: TabbedInterface,
  promo_banner: PromoBanner,
  local_jobs_grid: LocalJobsGrid,
  mission_banner: MissionBanner,
  blog_grid: BlogGrid,
};

interface PageBlokProps {
  blok: {
    _uid: string;
    _editable?: string;
    body?: SbBlokData[];
    [key: string]: unknown;
  };
}

export const PageBlok = ({ blok }: PageBlokProps) => {
  return (
    <div
      {...storyblokEditable(blok)}
      data-testid="storyblok-page-container"
      className="flex w-full flex-col"
    >
      {blok.body?.map((nestedBlok) => (
        <StoryblokComponent blok={nestedBlok} key={nestedBlok._uid} />
      ))}
    </div>
  );
};

export default PageBlok;
