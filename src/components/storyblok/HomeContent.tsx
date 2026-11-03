import React from 'react';
import { storyblokEditable, StoryblokComponent } from '@storyblok/react';
import type { SbBlokData } from '@storyblok/react';
import { HeroSection, LocalJobsGrid, MissionBanner, BlogGrid } from '@/components/blocks';

interface JobBoardItem {
  _uid: string;
  Name: string;
  Link: string;
  component: string;
}

interface HomeContentProps {
  blok: {
    _uid: string;
    _editable?: string;
    body?: SbBlokData[];
    Title?: string;
    Description?: string;
    CardTitle?: string;
    CardDescription?: string;
    CardImage?: {
      filename?: string;
      alt?: string;
    };
    JobBoardTitle?: string;
    JobBoard?: JobBoardItem[];
    BlogSectionTitle?: string;
    BlogSectionDescription?: string;
    [key: string]: unknown;
  };
}

export const HomeContent = ({ blok }: HomeContentProps) => {
  return (
    <div
      {...storyblokEditable(blok)}
      data-testid="storyblok-home-content-container"
      className="flex w-full flex-col"
    >
      {/* 1. Hero Section from Root Fields */}
      {blok.Title && <HeroSection title={blok.Title} description={blok.Description || ''} />}

      {/* 2. Mission / Promo Card from Root Fields */}
      {blok.CardTitle && (
        <MissionBanner
          title={blok.CardTitle}
          description={blok.CardDescription || ''}
          imageAlt={blok.CardImage?.alt || blok.CardTitle}
        />
      )}

      {/* 3. Local Job Board Links */}
      {blok.JobBoard && blok.JobBoard.length > 0 && (
        <LocalJobsGrid
          title={blok.JobBoardTitle || 'Local Opportunities'}
          jobs={blok.JobBoard.map((item) => ({
            id: item._uid,
            title: item.Name,
            href: item.Link,
          }))}
        />
      )}

      {/* 4. Blog / Insights Section Header */}
      {blok.BlogSectionTitle && (
        <>
          <section className="w-full">
            <h2>{blok.BlogSectionTitle}</h2>
            {blok.BlogSectionDescription && <p>{blok.BlogSectionDescription}</p>}
          </section>
          <BlogGrid />
        </>
      )}

      {/* 5. Fallback for dynamic modular bloks if added to body in the future */}
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
