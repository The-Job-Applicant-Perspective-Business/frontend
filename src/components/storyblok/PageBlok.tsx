import { storyblokEditable, StoryblokComponent } from '@storyblok/react';
import { PromoBanner } from '@/components/blocks/PromoBanner';
import { HeroSection } from '@/components/layout/HeroSection';
import { TabbedInterface } from '@/components/layout/TabbedInterface';
import { LocalJobsGrid } from '@/components/layout/LocalJobsGrid';
import { MissionBanner } from '@/components/layout/MissionBanner';
import { BlogGrid } from '@/components/layout/BlogGrid';

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
    body: Array<{ _uid: string; [key: string]: unknown }>;
    [key: string]: unknown;
  };
}

export const PageBlok = ({ blok }: PageBlokProps) => {
  return (
    <main {...storyblokEditable(blok)} className="w-full">
      {blok.body?.map((nestedBlok) => (
        <StoryblokComponent blok={nestedBlok} key={nestedBlok._uid} />
      ))}
    </main>
  );
};

export default PageBlok;
