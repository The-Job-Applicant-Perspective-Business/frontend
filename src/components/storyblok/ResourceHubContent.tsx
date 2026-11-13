import React from 'react';
import Link from 'next/link';
import { storyblokEditable, StoryblokComponent, renderRichText } from '@storyblok/react';
import type { SbBlokData, SbRichTextDoc } from '@storyblok/react';
import { ExternalLink, ArrowRight, Bookmark } from 'lucide-react';

interface ResourceItem {
  _uid: string;
  title?: string;
  Title?: string;
  description?: string;
  Description?: string;
  link?: string;
  Link?: string;
  url?: string;
  category?: string;
  Category?: string;
  tag?: string;
  isExternal?: boolean;
  [key: string]: unknown;
}

export interface ResourceHubContentProps {
  blok: {
    _uid: string;
    _editable?: string;
    Title?: string;
    Heading?: string;
    Subtitle?: string;
    Description?: string;
    Introduction?: string | SbRichTextDoc;
    Resources?: ResourceItem[];
    Items?: ResourceItem[];
    CategoryTitle?: string;
    body?: SbBlokData[];
    [key: string]: unknown;
  };
}

const sanitizeHref = (rawUrl?: string): string | null => {
  if (!rawUrl || typeof rawUrl !== 'string') return null;
  const trimmed = rawUrl.trim();
  if (!trimmed || trimmed === '#') return null;
  if (trimmed.startsWith('/') || trimmed.startsWith('https://') || trimmed.startsWith('http://')) {
    return trimmed;
  }
  return null;
};

export const ResourceHubContent: React.FC<ResourceHubContentProps> = ({ blok }) => {
  const pageTitle = blok.Heading || blok.Title || 'Support & Resource Directory';
  const pageSubtitle =
    blok.Subtitle ||
    blok.Description ||
    'Curated, zero-barrier support systems, assistance pathways, and advocacy tools.';

  const rawResources = blok.Resources || blok.Items || [];

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
      data-testid="storyblok-resource-hub-container"
      className="min-h-screen w-full bg-[#ffffff] text-[#434343]"
    >
      {/* Top Header Clearance Bar matching canonical subpage layout */}
      <div
        className="h-[70px] w-full border-b border-[#9CABC7] bg-[#ffffff] lg:h-[124px]"
        aria-hidden="true"
      />

      <article className="mx-auto flex w-full max-w-7xl flex-col px-4 py-12 sm:px-6 md:py-16 lg:px-8">
        {/* 1. Directory Header Landmark */}
        <section
          aria-labelledby="resource-hub-heading"
          className="mb-10 flex flex-col items-start border-b border-slate-200 pb-8 text-left md:mb-14"
        >
          <span className="mb-3 inline-flex items-center gap-1.5 text-xs font-bold tracking-wider text-[#0d3276] uppercase">
            <Bookmark className="h-3.5 w-3.5 text-[#0d3276]" aria-hidden="true" />
            Community Assistance &amp; Guidance
          </span>
          <h1
            id="resource-hub-heading"
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

        {/* 2. Resource Grid */}
        <section aria-label="Available Resources and Aid Programs" className="w-full">
          {blok.CategoryTitle && (
            <h2 className="mb-6 border-b border-slate-200 pb-2 text-2xl font-bold tracking-tight text-[#0d3276]">
              {blok.CategoryTitle}
            </h2>
          )}

          {rawResources.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
              {rawResources.map((item) => {
                const itemTitle = item.Title || item.title || 'Untitled Resource';
                const itemDescription = item.Description || item.description || '';
                const safeHref = sanitizeHref(item.Link || item.link || item.url);
                const itemCategory = item.Category || item.category || item.tag || 'Direct Aid';
                const isExternal =
                  safeHref !== null &&
                  (item.isExternal !== undefined
                    ? item.isExternal
                    : safeHref.startsWith('http://') || safeHref.startsWith('https://'));

                return (
                  <div
                    key={item._uid}
                    className="group flex w-full flex-col justify-between rounded-xl border border-slate-200 bg-[#ffffff] p-6 shadow-sm transition-all duration-200 hover:border-[#0d3276]/50 hover:shadow-md"
                  >
                    <div className="flex flex-col">
                      <span className="mb-2 text-xs font-bold tracking-wider text-[#434343] uppercase">
                        {itemCategory}
                      </span>
                      <h2 className="mb-3 text-xl font-bold text-[#0d3276] transition-colors group-hover:text-[#081F48]">
                        {itemTitle}
                      </h2>
                      {itemDescription && (
                        <p className="line-clamp-4 text-sm leading-relaxed text-[#434343]">
                          {itemDescription}
                        </p>
                      )}
                    </div>

                    <div className="mt-6 border-t border-slate-200 pt-4">
                      {safeHref ? (
                        isExternal ? (
                          <Link
                            href={safeHref}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`Access ${itemTitle} (opens in a new tab)`}
                            className="group/link inline-flex items-center gap-1.5 rounded-sm text-sm font-semibold text-[#0d3276] underline-offset-4 hover:text-[#081F48] hover:underline focus-visible:ring-2 focus-visible:ring-[#0d3276] focus-visible:ring-offset-2 focus-visible:outline-none"
                          >
                            <span>Access Program</span>
                            <ExternalLink
                              className="h-4 w-4 transition-transform group-hover/link:translate-x-0.5"
                              aria-hidden="true"
                            />
                          </Link>
                        ) : (
                          <Link
                            href={safeHref}
                            aria-label={`View details for ${itemTitle}`}
                            className="group/link inline-flex items-center gap-1.5 rounded-sm text-sm font-semibold text-[#0d3276] underline-offset-4 hover:text-[#081F48] hover:underline focus-visible:ring-2 focus-visible:ring-[#0d3276] focus-visible:ring-offset-2 focus-visible:outline-none"
                          >
                            <span>View Details</span>
                            <ArrowRight
                              className="h-4 w-4 transition-transform group-hover/link:translate-x-0.5"
                              aria-hidden="true"
                            />
                          </Link>
                        )
                      ) : (
                        <span className="text-xs font-medium text-slate-600">
                          Program link pending
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div
              role="status"
              className="flex min-h-64 w-full flex-col items-center justify-center rounded-xl border border-slate-200 bg-slate-50 p-8 text-center"
            >
              <p className="text-base font-medium text-[#434343]">
                No programs or resources cataloged in this directory yet.
              </p>
            </div>
          )}
        </section>

        {/* 3. Modular Storyblok Blok Extension */}
        {blok.body && blok.body.length > 0 && (
          <div className="mt-12 flex w-full flex-col gap-8 md:mt-16">
            {blok.body.map((nestedBlok) => (
              <StoryblokComponent blok={nestedBlok} key={nestedBlok._uid} />
            ))}
          </div>
        )}
      </article>
    </div>
  );
};

export default ResourceHubContent;
