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

export const dynamic = 'force-dynamic';

type DynamicPageProps = {
  params: Promise<{ slug?: string[] }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
};

/**
 * Discriminated result so the page can distinguish "no such page" from
 * "the CMS pipeline failed". `report: null` means an expected, unlogged miss
 * (system/browser paths).
 */
type StoryFetchResult =
  { ok: true; story: ISbStoryData } | { ok: false; report: StoryblokErrorReport | null };

const SYSTEM_SLUG_PREFIXES = ['.well-known', 'favicon.ico', 'robots.txt', 'sitemap.xml'];

const resolveSlugPath = (slug?: string[]): string => {
  return slug && slug.length > 0 ? slug.join('/') : 'home';
};

/**
 * Pulls an HTTP status off an unknown thrown value without trusting its shape.
 * Hardened to inspect status, statusCode, and response.status.
 */
const extractStatus = (error: unknown): number | undefined => {
  if (!error || typeof error !== 'object') {
    return undefined;
  }

  const value = error as {
    status?: unknown;
    statusCode?: unknown;
    response?: { status?: unknown };
  };

  const status = value.status ?? value.statusCode ?? value.response?.status;
  return typeof status === 'number' ? status : undefined;
};

/**
 * Deduplicated dynamic story fetcher bounded by safe DTO sanitization.
 * Wrapped in React.cache so metadata and page execution share one request.
 * This is the single logging boundary: handleStoryblokError is called here and
 * nowhere else in the route, so cached calls never log twice.
 */
const fetchDynamicStory = cache(
  async (slugPath: string, isDraft: boolean): Promise<StoryFetchResult> => {
    if (SYSTEM_SLUG_PREFIXES.some((prefix) => slugPath.startsWith(prefix))) {
      return { ok: false, report: null };
    }

    const context = { operation: 'fetchDynamicStory', slug: slugPath };

    const configIssue = getStoryblokConfigIssue();
    if (configIssue) {
      const report = handleStoryblokError(new Error(configIssue), {
        context,
        category: 'CONFIG',
      });
      return { ok: false, report };
    }

    try {
      initStoryblok();
      const storyblokApi = getStoryblokApi();
      const response = await storyblokApi.get(`cdn/stories/${slugPath}`, {
        version: isDraft ? 'draft' : 'published',
        cv: isDraft ? Date.now() : undefined,
        resolve_relations: '',
      });

      // Pass raw CMS payload to the deterministic unwrapper and Zod validator
      const result = safeSanitizeStoryPayload(response);

      if (!result.success) {
        const report = handleStoryblokError(
          new Error(`DTO validation rejected: ${String(result.error)}`),
          {
            context,
            category: 'VALIDATION',
          },
        );
        return { ok: false, report };
      }

      return { ok: true, story: result.data as unknown as ISbStoryData };
    } catch (error) {
      const status = extractStatus(error);
      const errorContext = {
        ...context,
        status,
      };

      const report = handleStoryblokError(error, {
        context: errorContext,
        category: status === 404 ? ('NOT_FOUND' as const) : undefined,
      });

      return { ok: false, report };
    }
  },
);

export const generateMetadata = async ({ params }: DynamicPageProps): Promise<Metadata> => {
  const { slug } = await params;
  const slugPath = resolveSlugPath(slug);
  const { isEnabled: isDraft } = await draftMode();

  const result = await fetchDynamicStory(slugPath, isDraft);

  // Metadata never throws: any failure degrades to site defaults and the page
  // body decides the user-facing outcome.
  if (!result.ok || !result.story.content) {
    return {
      title: 'The Job Applicant Perspective',
      description: 'Documenting the applicant timeline and market dynamics.',
    };
  }

  const { story } = result;
  const metaTitle =
    (story.content.meta_title as string) || story.name || 'The Job Applicant Perspective';
  const metaDescription =
    (story.content.meta_description as string) ||
    'Documenting the applicant timeline and market dynamics.';

  return {
    title: metaTitle,
    description: metaDescription,
    openGraph: {
      title: metaTitle,
      description: metaDescription,
    },
    twitter: {
      card: 'summary_large_image',
      title: metaTitle,
      description: metaDescription,
    },
  };
};

const DynamicPage = async ({ params }: DynamicPageProps) => {
  const { slug } = await params;
  const slugPath = resolveSlugPath(slug);
  const { isEnabled: isDraft } = await draftMode();

  const result = await fetchDynamicStory(slugPath, isDraft);

  if (!result.ok) {
    const { report } = result;

    // Expected misses and corrupt payloads keep the existing clean-404 behavior.
    if (!report || report.category === 'NOT_FOUND' || report.category === 'VALIDATION') {
      notFound();
    }

    // CONFIG / API / INITIALIZATION / UNKNOWN are not "missing pages".
    // Hand off to the nearest error boundary with only the visitor-safe message.
    throw new Error(report.safeMessage);
  }

  return (
    <div className="relative flex w-full flex-grow flex-col">
      <StoryblokStory story={result.story} />
    </div>
  );
};

export default DynamicPage;
