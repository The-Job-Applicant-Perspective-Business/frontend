import React from 'react';
import { storyblokEditable, StoryblokComponent } from '@storyblok/react';
import type { SbBlokData } from '@storyblok/react';
import {
  HeroSection,
  TabbedInterface,
  PromoBanner,
  MissionBanner,
  LocalJobsGrid,
  BlogGrid,
} from '@/components/blocks';
import type { LocalJobItem } from '@/components/blocks/LocalJobsGrid';

interface StoryblokJobBoardItem {
  _uid: string;
  Name: string;
  Link: string;
  component: string;
}

interface StoryblokAsset {
  id?: number;
  filename?: string;
  alt?: string;
  [key: string]: unknown;
}

export interface HomeContentProps {
  blok: {
    _uid: string;
    _editable?: string;
    body?: SbBlokData[];
    Title?: string;
    Description?: string;
    BannerMobile?: string | StoryblokAsset;
    BannerDesktop?: string | StoryblokAsset;
    CardTitle?: string;
    CardDescription?: string;
    CardImage?: StoryblokAsset;
    JobBoardTitle?: string;
    JobBoard?: StoryblokJobBoardItem[];
    BlogSectionTitle?: string;
    BlogSectionDescription?: string;
    [key: string]: unknown;
  };
}

const resolveAssetUrl = (asset?: string | StoryblokAsset): string | undefined => {
  if (!asset) return undefined;
  if (typeof asset === 'string') return asset;
  return asset.filename;
};

export const HomeContent = ({ blok }: HomeContentProps) => {
  // Normalize Storyblok JobBoard items to strict LocalJobItem shape
  const formattedJobs: LocalJobItem[] | undefined = blok.JobBoard?.map((item) => ({
    title: item.Name,
    href: item.Link,
    isExternal: true,
  }));

  const mobileBanner = resolveAssetUrl(blok.BannerMobile);
  const desktopBanner = resolveAssetUrl(blok.BannerDesktop);

  return (
    <div
      {...storyblokEditable(blok)}
      data-testid="storyblok-home-content-container"
      className="flex w-full flex-col"
    >
      {/* 1. Hero Section */}
      {blok.Title && <HeroSection headline={blok.Title} description={blok.Description} />}

      {/* 2. Classified vs. Hiring Feedback Search Interface */}
      <TabbedInterface defaultTab="classified" />

      {/* 3. Promotional Dual-Asset Banner */}
      <PromoBanner mobileImageSrc={mobileBanner} desktopImageSrc={desktopBanner} />

      {/* 4. Mission Banner: ctaHref points directly to the verified Storyblok slug */}
      {blok.CardTitle && (
        <MissionBanner
          heading={blok.CardTitle}
          description={blok.CardDescription}
          imageSrc={blok.CardImage?.filename}
          imageAlt={blok.CardImage?.alt || blok.CardTitle}
          ctaText="Know more"
          ctaHref="/about-us"
        />
      )}

      {/* 5. Local Job Board Links */}
      {formattedJobs && formattedJobs.length > 0 && (
        <LocalJobsGrid
          heading={blok.JobBoardTitle || 'For more local jobs and opportunities visit'}
          jobs={formattedJobs}
        />
      )}

      {/* 6. Blog / Research Insights */}
      {blok.BlogSectionTitle && (
        <BlogGrid title={blok.BlogSectionTitle} description={blok.BlogSectionDescription} />
      )}

      {/* 7. Fallback Container for Future Modular Storyblok Bloks */}
      {blok.body && blok.body.length > 0 && (
        <div className="flex w-full flex-col">
          {blok.body.map((nestedBlok) => (
            <StoryblokComponent blok={nestedBlok} key={nestedBlok._uid} />
          ))}
        </div>
      )}
    </div>
  );
};

export default HomeContent;
