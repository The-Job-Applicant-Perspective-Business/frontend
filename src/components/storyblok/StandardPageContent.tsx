import React from 'react';
import { storyblokEditable, StoryblokComponent, renderRichText } from '@storyblok/react';
import type { SbBlokData, SbRichTextDoc } from '@storyblok/react';

export interface StandardPageContentProps {
  blok: {
    _uid: string;
    _editable?: string;
    Title?: string;
    Heading?: string;
    Subtitle?: string;
    Description?: string;
    Category?: string;
    Introduction?: string | SbRichTextDoc;
    body?: SbBlokData[];
    [key: string]: unknown;
  };
}

export const StandardPageContent: React.FC<StandardPageContentProps> = ({ blok }) => {
  const pageTitle = blok.Heading || blok.Title || 'The Job Applicant Perspective';
  const pageSubtitle = blok.Subtitle || blok.Description;
  const categoryLabel = blok.Category;

  const renderIntro = (): React.ReactNode => {
    if (!blok.Introduction) return null;

    const rawHtml =
      typeof blok.Introduction === 'string'
        ? blok.Introduction
        : renderRichText(blok.Introduction) || '';

    if (!rawHtml) return null;

    return (
      <div
        className="prose prose-slate prose-headings:text-[#0d3276] prose-a:text-[#0d3276] prose-a:underline hover:prose-a:text-[#081F48] max-w-none text-base leading-relaxed text-[#434343]"
        dangerouslySetInnerHTML={{ __html: rawHtml }}
      />
    );
  };

  return (
    <div
      {...storyblokEditable(blok)}
      data-testid="storyblok-standard-page-container"
      className="min-h-screen w-full bg-[#ffffff] text-[#434343]"
    >
      {/* Canonical Header Clearance Spacer */}
      <div
        className="h-[70px] w-full border-b border-[#9CABC7] bg-[#ffffff] lg:h-[124px]"
        aria-hidden="true"
      />

      <article className="mx-auto flex w-full max-w-7xl flex-col px-4 py-12 sm:px-6 md:py-16 lg:px-8">
        <section
          aria-labelledby="standard-page-heading"
          className="mb-10 flex flex-col items-start border-b border-slate-200 pb-8 text-left md:mb-14"
        >
          {categoryLabel && (
            <span className="mb-3 text-xs font-bold tracking-wider text-[#0d3276] uppercase">
              {categoryLabel}
            </span>
          )}
          <h1
            id="standard-page-heading"
            className="text-3xl font-bold tracking-tight text-[#0d3276] sm:text-4xl lg:text-5xl"
          >
            {pageTitle}
          </h1>
          {pageSubtitle && (
            <p className="mt-4 max-w-3xl text-lg leading-relaxed text-[#434343] sm:text-xl">
              {pageSubtitle}
            </p>
          )}
          {blok.Introduction && <div className="mt-6 max-w-3xl">{renderIntro()}</div>}
        </section>

        {blok.body && blok.body.length > 0 && (
          <div className="flex w-full flex-col gap-10 md:gap-14">
            {blok.body.map((nestedBlok) => (
              <StoryblokComponent blok={nestedBlok} key={nestedBlok._uid} />
            ))}
          </div>
        )}
      </article>
    </div>
  );
};

export default StandardPageContent;
