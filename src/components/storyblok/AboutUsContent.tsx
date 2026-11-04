import React from 'react';
import Image from 'next/image';
import { storyblokEditable } from '@storyblok/react';

interface StoryblokAsset {
  id?: number;
  filename?: string;
  alt?: string;
  [key: string]: unknown;
}

interface StoryCardItem {
  _uid: string;
  Heading: string;
  Description: string;
  Image?: StoryblokAsset;
  component: string;
}

interface TeamMemberItem {
  _uid: string;
  Name: string;
  Role: string;
  Image?: StoryblokAsset;
  component: string;
}

export interface AboutUsContentProps {
  blok: {
    _uid: string;
    _editable?: string;
    Heading?: string;
    Stories?: StoryCardItem[];
    TeamHeading?: string;
    TeamDescription?: string;
    Team?: TeamMemberItem[];
    DonationHeading?: string;
    DonationDescription?: string;
    DonationImage?: StoryblokAsset;
    [key: string]: unknown;
  };
}

export const AboutUsContent = ({ blok }: AboutUsContentProps) => {
  return (
    <article
      {...storyblokEditable(blok)}
      data-testid="storyblok-about-us-container"
      className="flex w-full flex-col"
    >
      {/* 1. Page Header */}
      <header className="border-border from-accent-bg/30 via-background to-background relative w-full border-b bg-gradient-to-b pt-24 pb-12 sm:pt-32 sm:pb-16 md:pt-36 md:pb-20">
        <div className="px-gutter mx-auto w-full max-w-7xl text-center">
          <h1 className="text-foreground leading-tight font-extrabold tracking-tight text-[var(--text-fluid-hero)]">
            {blok.Heading || 'Who We Are'}
          </h1>
        </div>
      </header>

      {/* 2. Narrative Stories Section */}
      {blok.Stories && blok.Stories.length > 0 && (
        <section
          aria-labelledby="stories-heading"
          className="px-gutter py-section mx-auto w-full max-w-7xl"
        >
          <h2 id="stories-heading" className="sr-only">
            Our Mission and Vision
          </h2>
          <div className="flex flex-col gap-16 md:gap-24">
            {blok.Stories.map((story, index) => {
              const isReversed = index % 2 !== 0;
              const hasImage = Boolean(story.Image?.filename);

              return (
                <div
                  key={story._uid}
                  className={`flex flex-col items-center justify-between gap-8 md:flex-row md:gap-12 lg:gap-16 ${
                    isReversed ? 'md:flex-row-reverse' : ''
                  }`}
                >
                  {/* Story Image */}
                  <div className="relative flex w-full justify-center md:w-1/2">
                    <div className="border-border/60 bg-muted relative aspect-3/2 w-full max-w-lg overflow-hidden rounded-xl border shadow-sm">
                      {hasImage ? (
                        <Image
                          src={story.Image!.filename!}
                          alt={story.Image?.alt || story.Heading}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          className="object-cover"
                        />
                      ) : (
                        <div
                          aria-hidden="true"
                          className="from-muted via-accent-bg/20 to-muted flex h-full w-full items-center justify-center bg-gradient-to-br"
                        />
                      )}
                    </div>
                  </div>

                  {/* Story Text */}
                  <div className="flex w-full flex-col items-start md:w-1/2">
                    <h3 className="text-foreground text-2xl leading-tight font-bold sm:text-3xl md:text-4xl">
                      {story.Heading}
                    </h3>
                    <p className="text-muted-foreground mt-4 text-base leading-relaxed sm:text-lg">
                      {story.Description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 3. Team Roster Section */}
      {blok.Team && blok.Team.length > 0 && (
        <section
          aria-labelledby="team-heading"
          className="border-border bg-accent-bg/10 px-gutter py-section w-full border-t border-b"
        >
          <div className="mx-auto w-full max-w-7xl">
            <div className="mb-12 text-center md:mb-16">
              <h2
                id="team-heading"
                className="text-foreground text-3xl leading-tight font-bold sm:text-4xl"
              >
                {blok.TeamHeading || 'Meet the Team'}
              </h2>
              {blok.TeamDescription && (
                <p className="text-muted-foreground mx-auto mt-4 max-w-2xl text-base leading-relaxed sm:text-lg">
                  {blok.TeamDescription}
                </p>
              )}
            </div>

            <div className="gap-card-gap grid w-full grid-cols-[repeat(auto-fit,minmax(min(100%,18rem),1fr))] justify-center">
              {blok.Team.map((member) => (
                <div
                  key={member._uid}
                  className="border-border bg-background flex flex-col items-center overflow-hidden rounded-xl border p-6 text-center shadow-sm"
                >
                  <div className="border-border/60 bg-muted relative mb-4 h-40 w-40 overflow-hidden rounded-full border shadow-inner">
                    {member.Image?.filename ? (
                      <Image
                        src={member.Image.filename}
                        alt={member.Image.alt || member.Name}
                        fill
                        sizes="160px"
                        className="object-cover"
                      />
                    ) : (
                      <div
                        aria-hidden="true"
                        className="from-muted to-accent-bg/30 flex h-full w-full items-center justify-center bg-gradient-to-br"
                      />
                    )}
                  </div>
                  <h3 className="text-foreground text-xl font-bold">{member.Name}</h3>
                  <p className="text-primary mt-1 text-sm font-semibold">{member.Role}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 4. Contribution / Buy Me a Coffee Block */}
      {blok.DonationHeading && (
        <section
          aria-labelledby="donation-heading"
          className="px-gutter py-section mx-auto w-full max-w-7xl"
        >
          <div className="border-border from-accent-bg/30 via-background to-background relative flex flex-col items-center justify-between gap-8 rounded-2xl border bg-gradient-to-r p-8 sm:p-12 md:flex-row md:gap-12">
            <div className="flex w-full flex-col items-start md:w-2/3">
              <h2
                id="donation-heading"
                className="text-foreground text-2xl leading-tight font-bold sm:text-3xl"
              >
                {blok.DonationHeading}
              </h2>
              <p className="text-muted-foreground mt-4 text-base leading-relaxed sm:text-lg">
                {blok.DonationDescription}
              </p>
            </div>

            {blok.DonationImage?.filename && (
              <div className="relative flex w-full justify-center md:w-1/3">
                <div className="border-border/40 relative h-36 w-36 overflow-hidden rounded-2xl sm:h-44 sm:w-44">
                  <Image
                    src={blok.DonationImage.filename}
                    alt={blok.DonationImage.alt || blok.DonationHeading}
                    fill
                    sizes="176px"
                    className="object-contain"
                  />
                </div>
              </div>
            )}
          </div>
        </section>
      )}
    </article>
  );
};

export default AboutUsContent;
