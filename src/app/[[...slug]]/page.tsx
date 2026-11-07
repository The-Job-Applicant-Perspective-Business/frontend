import { cache } from 'react';
import type { Metadata } from 'next';
import { draftMode } from 'next/headers';
import { notFound } from 'next/navigation';
import { getStoryblokApi, StoryblokStory } from '@storyblok/react/rsc';
import type { ISbStoryData } from '@storyblok/react';
import { getStoryblokConfigIssue, initStoryblok } from '@/lib/storyblok';
import { safeSanitizeStoryPayload } from '@/lib/dto/sanitizeStoryPayload';
import {
  handleStoryblokError,
  type StoryblokErrorReport,
} from '@/lib/dto/storyblok/storyblokErrorHandler';
import { sanitizeSlugSegments, sanitizeSearchParams } from '@/lib/security/sanitizeParams';

export const dynamic = 'force-dynamic';

type DynamicPageProps = {
  params: Promise<{ slug?: string[] }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
};

type StoryFetchResult =
  { ok: true; story: ISbStoryData } | { ok: false; report: StoryblokErrorReport | null };

const SYSTEM_SLUG_PREFIXES = ['.well-known', 'favicon.ico', 'robots.txt', 'sitemap.xml'];

/**
 * Extracts numeric HTTP status from diverse error shapes thrown by Storyblok SDK.
 */
const extractStatus = (error: unknown): number | undefined => {
  if (!error) return undefined;
  if (typeof error === 'number') return error;

  if (typeof error === 'string') {
    const parsed = parseInt(error, 10);
    return isNaN(parsed) ? undefined : parsed;
  }

  if (typeof error === 'object') {
    const val = error as Record<string, unknown>;
    const rawStatus =
      val.status ?? val.statusCode ?? (val.response as Record<string, unknown> | undefined)?.status;

    if (typeof rawStatus === 'number') return rawStatus;
    if (typeof rawStatus === 'string') {
      const parsed = parseInt(rawStatus, 10);
      if (!isNaN(parsed)) return parsed;
    }

    if (typeof val.message === 'string') {
      try {
        const json = JSON.parse(val.message);
        if (json && typeof json === 'object') {
          const s =
            (json as Record<string, unknown>).status ??
            (json as Record<string, unknown>).statusCode;
          const parsed = typeof s === 'number' ? s : parseInt(String(s), 10);
          if (!isNaN(parsed)) return parsed;
        }
      } catch {
        if (val.message.includes('404')) return 404;
      }
    }
  }

  return undefined;
};

/**
 * Generates an ordered, deduplicated list of candidate slugs to query against Storyblok.
 */
const getCandidateSlugs = (slugSegments: string[]): string[] => {
  if (slugSegments.length === 0) {
    return ['home'];
  }

  // 1. Single-segment known aliases
  if (slugSegments.length === 1) {
    const single = slugSegments[0];
    if (single === 'job-insights') return ['blog-listing', 'blog'];
    if (single === 'who-we-are') return ['about-us'];
    if (single === 'us-govt-financial-support') return ['financial-support'];
    if (single === 'self-care-tools') return ['self-care'];
    return [single];
  }

  // 2. Multi-segment routes (e.g. /job-insights/[slug] or /blog/[slug])
  const subSlug = slugSegments.slice(1).join('/');
  const rawPath = slugSegments.join('/');

  return Array.from(
    new Set([
      subSlug, // Root story: e.g. building-the-future-of-job-searching-academically
      `blog/${subSlug}`, // Nested folder variant
      rawPath, // Raw route variant
    ]),
  );
};

const fetchDynamicStory = cache(
  async (slugSegments: string[], isDraft: boolean): Promise<StoryFetchResult> => {
    const rawPath = slugSegments.join('/');
    if (SYSTEM_SLUG_PREFIXES.some((prefix) => rawPath.startsWith(prefix))) {
      return { ok: false, report: null };
    }

    const context = { operation: 'fetchDynamicStory', slug: rawPath };

    const configIssue = getStoryblokConfigIssue();
    if (configIssue) {
      const report = handleStoryblokError(new Error(configIssue), {
        context,
        category: 'CONFIG',
      });
      return { ok: false, report };
    }

    const candidateSlugs = getCandidateSlugs(slugSegments);
    const versionsToTry: Array<'published' | 'draft'> = isDraft
      ? ['draft']
      : ['published', 'draft'];

    try {
      initStoryblok();
      const storyblokApi = getStoryblokApi();
      let lastError: unknown = null;

      // Phase 1: Exact candidate lookups
      for (const version of versionsToTry) {
        for (const candidate of candidateSlugs) {
          try {
            const response = await storyblokApi.get(`cdn/stories/${candidate}`, {
              version,
              cv: version === 'draft' ? Date.now() : undefined,
              resolve_relations: '',
            });

            if (response?.data?.story) {
              const result = safeSanitizeStoryPayload(response);
              if (!result.success) {
                return { ok: true, story: response.data.story as unknown as ISbStoryData };
              }
              return { ok: true, story: result.data as unknown as ISbStoryData };
            }
          } catch (err) {
            lastError = err;
            const status = extractStatus(err);
            if (status !== 404) {
              throw err;
            }
          }
        }
      }

      // Phase 2: Wildcard fallback search (handles truncated slugs & case-mismatches)
      const primaryTarget = candidateSlugs[0];
      for (const version of versionsToTry) {
        try {
          const searchResponse = await storyblokApi.get('cdn/stories', {
            by_slugs: `*${primaryTarget}*`,
            version,
            cv: version === 'draft' ? Date.now() : undefined,
            per_page: 1,
          });

          const matchedStory = searchResponse?.data?.stories?.[0];
          if (matchedStory) {
            return { ok: true, story: matchedStory as unknown as ISbStoryData };
          }
        } catch (searchErr) {
          lastError = searchErr;
        }
      }

      console.error(`[fetchDynamicStory] Story not found. Candidates tried:`, candidateSlugs);

      const report = handleStoryblokError(lastError ?? new Error(`Story not found: ${rawPath}`), {
        context: { ...context, status: 404 },
        category: 'NOT_FOUND',
      });

      return { ok: false, report };
    } catch (error) {
      const status = extractStatus(error);
      const report = handleStoryblokError(error, {
        context: { ...context, status },
        category: status === 404 ? ('NOT_FOUND' as const) : undefined,
      });

      return { ok: false, report };
    }
  },
);

export const generateMetadata = async ({ params }: DynamicPageProps): Promise<Metadata> => {
  const { slug } = await params;
  const sanitizedSlug = sanitizeSlugSegments(slug);

  if (sanitizedSlug === null) {
    return {
      title: 'Not Found | The Job Applicant Perspective',
      description: 'The requested document contains invalid path parameters.',
    };
  }

  const { isEnabled: isDraft } = await draftMode();
  const result = await fetchDynamicStory(sanitizedSlug, isDraft);

  if (!result.ok || !result.story.content) {
    return {
      title: 'The Job Applicant Perspective',
      description: 'Documenting the applicant timeline and market dynamics.',
    };
  }

  const { story } = result;
  const content = story.content;

  const metaTitle =
    (content.SeoTitle as string) ||
    (content.meta_title as string) ||
    (content.Title as string) ||
    (content.title as string) ||
    story.name ||
    'The Job Applicant Perspective';

  const metaDescription =
    (content.SeoDescription as string) ||
    (content.meta_description as string) ||
    (content.Subtitle as string) ||
    (content.subtitle as string) ||
    (content.Description as string) ||
    (content.description as string) ||
    'Documenting the applicant timeline and market dynamics.';

  const seoImageUrl =
    typeof content.SeoImage === 'object' && content.SeoImage !== null
      ? (content.SeoImage as { filename?: string }).filename
      : typeof content.Image === 'object' && content.Image !== null
        ? (content.Image as { filename?: string }).filename
        : typeof content.image === 'object' && content.image !== null
          ? (content.image as { filename?: string }).filename
          : undefined;

  return {
    title: metaTitle,
    description: metaDescription,
    openGraph: {
      title: metaTitle,
      description: metaDescription,
      images: seoImageUrl ? [{ url: seoImageUrl }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: metaTitle,
      description: metaDescription,
      images: seoImageUrl ? [seoImageUrl] : undefined,
    },
  };
};

const DynamicPage = async ({ params, searchParams }: DynamicPageProps) => {
  const [resolvedParams, resolvedSearchParams] = await Promise.all([params, searchParams]);

  const sanitizedSlug = sanitizeSlugSegments(resolvedParams.slug);
  if (sanitizedSlug === null) {
    notFound();
  }

  const cleanSearchParams = sanitizeSearchParams(resolvedSearchParams);
  void cleanSearchParams;

  const { isEnabled: isDraft } = await draftMode();
  const result = await fetchDynamicStory(sanitizedSlug, isDraft);

  if (!result.ok) {
    const { report } = result;
    if (!report || report.category === 'NOT_FOUND') {
      notFound();
    }
    throw new Error(report.safeMessage);
  }

  return (
    <div className="relative flex w-full flex-grow flex-col">
      <StoryblokStory story={result.story} />
    </div>
  );
};

export default DynamicPage;
