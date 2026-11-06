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

export const ResourceHubContent: React.FC<ResourceHubContentProps> = ({ blok }) => {
  const pageTitle = blok.Heading || blok.Title || 'Support & Resource Directory';
  const pageSubtitle =
    blok.Subtitle ||
    blok.Description ||
    'Curated, zero-barrier support systems, assistance pathways, and advocacy tools.';

  const rawResources = blok.Resources || blok.Items || [];

  const renderIntro = () => {
    if (!blok.Introduction) return null;

    if (typeof blok.Introduction === 'string') {
      return (
        <div
          className="prose prose-neutral dark:prose-invert text-muted-foreground max-w-none text-base leading-relaxed"
          dangerouslySetInnerHTML={{ __html: blok.Introduction }}
        />
      );
    }

    const htmlContent = renderRichText(blok.Introduction);
    return (
      <div
        className="prose prose-neutral dark:prose-invert text-muted-foreground max-w-none text-base leading-relaxed"
        dangerouslySetInnerHTML={{ __html: htmlContent }}
      />
    );
  };

  return (
    <article
      {...storyblokEditable(blok)}
      data-testid="storyblok-resource-hub-container"
      className="px-gutter mx-auto flex w-full max-w-7xl flex-col py-12 md:py-16"
    >
      {/* 1. Directory Header Landmark */}
      <header className="border-border/60 mb-10 flex flex-col items-start border-b pb-8 text-left md:mb-14">
        <span className="text-muted-foreground mb-3 inline-flex items-center gap-1.5 text-xs font-bold tracking-wider uppercase">
          <Bookmark className="text-primary h-3.5 w-3.5" aria-hidden="true" />
          Community Assistance &amp; Guidance
        </span>
        <h1 className="text-primary font-bold tracking-tight text-[var(--text-fluid-2xl)]">
          {pageTitle}
        </h1>
        {pageSubtitle && (
          <p className="text-muted-foreground mt-3 max-w-3xl text-balance text-[var(--text-fluid-lg)]">
            {pageSubtitle}
          </p>
        )}
        {blok.Introduction && <div className="mt-6 max-w-3xl">{renderIntro()}</div>}
      </header>

      {/* 2. Resource Grid */}
      <section aria-label="Available Resources and Aid Programs" className="w-full">
        {rawResources.length > 0 ? (
          <div className="gap-gutter grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {rawResources.map((item) => {
              const itemTitle = item.Title || item.title || 'Untitled Resource';
              const itemDescription = item.Description || item.description || '';
              const itemUrl = item.Link || item.link || item.url || '#';
              const itemCategory = item.Category || item.category || item.tag || 'Direct Aid';
              const isExternal =
                item.isExternal !== undefined
                  ? item.isExternal
                  : itemUrl.startsWith('http://') || itemUrl.startsWith('https://');

              return (
                <div
                  key={item._uid}
                  className="group bg-card border-border hover:border-primary/50 flex w-full flex-col justify-between rounded-xl border p-6 shadow-sm transition-all duration-200 hover:shadow-md"
                >
                  <div className="flex flex-col">
                    <span className="text-muted-foreground mb-2 text-xs font-bold tracking-wider uppercase">
                      {itemCategory}
                    </span>
                    <h2 className="text-foreground group-hover:text-primary mb-3 text-xl font-bold transition-colors">
                      {itemTitle}
                    </h2>
                    {itemDescription && (
                      <p className="text-muted-foreground line-clamp-4 text-sm leading-relaxed">
                        {itemDescription}
                      </p>
                    )}
                  </div>

                  <div className="border-border/40 mt-6 border-t pt-4">
                    {isExternal ? (
                      <Link
                        href={itemUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary group/link focus-visible:ring-focus-ring inline-flex items-center gap-1.5 text-sm font-semibold hover:underline focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                      >
                        <span>Access Program</span>
                        <ExternalLink
                          className="h-4 w-4 transition-transform group-hover/link:translate-x-0.5"
                          aria-hidden="true"
                        />
                        <span className="sr-only"> (opens in a new tab)</span>
                      </Link>
                    ) : (
                      <Link
                        href={itemUrl}
                        className="text-primary group/link focus-visible:ring-focus-ring inline-flex items-center gap-1.5 text-sm font-semibold hover:underline focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                      >
                        <span>View Details</span>
                        <ArrowRight
                          className="h-4 w-4 transition-transform group-hover/link:translate-x-0.5"
                          aria-hidden="true"
                        />
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="border-border bg-muted/30 p-gutter flex min-h-64 w-full flex-col items-center justify-center rounded-xl border text-center">
            <p className="text-muted-foreground text-[var(--text-fluid-base)]">
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
  );
};

export default ResourceHubContent;
