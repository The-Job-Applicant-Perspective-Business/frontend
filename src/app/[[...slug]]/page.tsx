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

const resolveSlugPath = (slugSegments: string[]): string => {
  return slugSegments.length > 0 ? slugSegments.join('/') : 'home';
};

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
  const sanitizedSlug = sanitizeSlugSegments(slug);

  if (sanitizedSlug === null) {
    return {
      title: 'Not Found | The Job Applicant Perspective',
      description: 'The requested document contains invalid path parameters.',
    };
  }

  const slugPath = resolveSlugPath(sanitizedSlug);
  const { isEnabled: isDraft } = await draftMode();

  const result = await fetchDynamicStory(slugPath, isDraft);

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

const DynamicPage = async ({ params, searchParams }: DynamicPageProps) => {
  const [resolvedParams, resolvedSearchParams] = await Promise.all([params, searchParams]);

  const sanitizedSlug = sanitizeSlugSegments(resolvedParams.slug);

  // If path contains traversal or illegal characters, reject immediately at the edge.
  if (sanitizedSlug === null) {
    notFound();
  }

  // Sanitize query parameters before downstream consumption.
  const cleanSearchParams = sanitizeSearchParams(resolvedSearchParams);
  void cleanSearchParams;

  const slugPath = resolveSlugPath(sanitizedSlug);
  const { isEnabled: isDraft } = await draftMode();

  const result = await fetchDynamicStory(slugPath, isDraft);

  if (!result.ok) {
    const { report } = result;

    if (!report || report.category === 'NOT_FOUND' || report.category === 'VALIDATION') {
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
