import React from 'react';
import { storyblokEditable, StoryblokComponent } from '@storyblok/react';
import type { SbBlokData } from '@storyblok/react';
import { BlogCard } from '@/components/blocks/BlogCard';

interface StoryblokAsset {
  id?: number;
  filename?: string;
  alt?: string;
  [key: string]: unknown;
}

interface StoryblokArticleItem {
  _uid: string;
  title?: string;
  Title?: string;
  description?: string;
  Description?: string;
  slug?: string;
  image?: StoryblokAsset | string;
  Image?: StoryblokAsset | string;
  published_at?: string;
  date?: string;
  tag?: string;
  category?: string;
  [key: string]: unknown;
}

export interface BlogListingContentProps {
  blok: {
    _uid: string;
    _editable?: string;
    Title?: string;
    Heading?: string;
    Description?: string;
    Subheading?: string;
    Articles?: StoryblokArticleItem[];
    FeaturedArticle?: StoryblokArticleItem;
    body?: SbBlokData[];
    [key: string]: unknown;
  };
}

const resolveAssetUrl = (asset?: string | StoryblokAsset): string | undefined => {
  if (!asset) return undefined;
  if (typeof asset === 'string') return asset;
  return asset.filename;
};

const resolveAssetAlt = (
  asset?: string | StoryblokAsset,
  fallback = 'Article thumbnail',
): string => {
  if (!asset || typeof asset === 'string') return fallback;
  return asset.alt || fallback;
};

export const BlogListingContent: React.FC<BlogListingContentProps> = ({ blok }) => {
  const pageHeading = blok.Heading || blok.Title || 'Job Insights & Labor Analytics';
  const pageDescription =
    blok.Description ||
    blok.Subheading ||
    'Evidence-based research, market data forensics, and applicant perspective reporting.';

  const rawArticles = blok.Articles || [];

  return (
    <article
      {...storyblokEditable(blok)}
      data-testid="storyblok-blog-listing-container"
      className="px-gutter mx-auto flex w-full max-w-7xl flex-col py-12 md:py-16"
    >
      {/* 1. Header / Directory Landmark */}
      <header className="mb-12 flex flex-col items-center text-center md:mb-16">
        <h1 className="text-primary font-bold tracking-tight text-[var(--text-fluid-2xl)]">
          {pageHeading}
        </h1>
        {pageDescription && (
          <p className="text-muted-foreground mt-4 max-w-3xl text-balance text-[var(--text-fluid-lg)]">
            {pageDescription}
          </p>
        )}
      </header>

      {/* 2. Featured Article Slot (if configured in CMS) */}
      {blok.FeaturedArticle && (
        <section aria-label="Featured Investigation" className="mb-12 w-full md:mb-16">
          <div className="border-border bg-card p-gutter rounded-xl border shadow-sm">
            <BlogCard
              title={blok.FeaturedArticle.Title || blok.FeaturedArticle.title || 'Featured Insight'}
              description={
                blok.FeaturedArticle.Description || blok.FeaturedArticle.description || ''
              }
              imageSrc={resolveAssetUrl(blok.FeaturedArticle.Image || blok.FeaturedArticle.image)}
              imageAlt={resolveAssetAlt(
                blok.FeaturedArticle.Image || blok.FeaturedArticle.image,
                blok.FeaturedArticle.Title || blok.FeaturedArticle.title,
              )}
              href={`/blog/${blok.FeaturedArticle.slug || ''}`}
              date={blok.FeaturedArticle.published_at || blok.FeaturedArticle.date}
              category={blok.FeaturedArticle.category || blok.FeaturedArticle.tag || 'Analysis'}
              featured={true}
            />
          </div>
        </section>
      )}

      {/* 3. Primary Article Grid */}
      <section aria-label="Published Insights Directory" className="w-full">
        {rawArticles.length > 0 ? (
          <div className="gap-gutter grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {rawArticles.map((article) => {
              const title = article.Title || article.title || 'Untitled Report';
              const description = article.Description || article.description || '';
              const imageSrc = resolveAssetUrl(article.Image || article.image);
              const imageAlt = resolveAssetAlt(article.Image || article.image, title);
              const slug = article.slug ? `/blog/${article.slug}` : '#';
              const date = article.published_at || article.date;
              const category = article.category || article.tag || 'Labor Market';

              return (
                <BlogCard
                  key={article._uid}
                  title={title}
                  description={description}
                  imageSrc={imageSrc}
                  imageAlt={imageAlt}
                  href={slug}
                  date={date}
                  category={category}
                />
              );
            })}
          </div>
        ) : (
          <div className="border-border bg-muted/30 p-gutter flex min-h-64 w-full flex-col items-center justify-center rounded-xl border text-center">
            <p className="text-muted-foreground text-[var(--text-fluid-base)]">
              No articles cataloged in this directory yet.
            </p>
          </div>
        )}
      </section>

      {/* 4. Modular Storyblok Blok Extension */}
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

export default BlogListingContent;
