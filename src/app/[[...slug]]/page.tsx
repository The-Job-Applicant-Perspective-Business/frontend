import { cache } from 'react';
import type { Metadata } from 'next';
import { draftMode } from 'next/headers';
import { notFound } from 'next/navigation';
import { getStoryblokApi, StoryblokStory } from '@storyblok/react/rsc';
import type { ISbStoryData } from '@storyblok/react';
import { initStoryblok } from '@/lib/storyblok';
import { safeSanitizeStoryPayload } from '@/lib/dto/sanitizeStoryPayload';

export const dynamic = 'force-dynamic';

type DynamicPageProps = {
  params: Promise<{ slug?: string[] }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
};

const resolveSlugPath = (slug?: string[]): string => {
  return slug && slug.length > 0 ? slug.join('/') : 'home';
};

/**
 * Deduplicated dynamic story fetcher bounded by safe DTO sanitization.
 * Wrapped in React.cache to share a single request between metadata and page execution.
 */
const fetchDynamicStory = cache(
  async (slugPath: string, isDraft: boolean): Promise<ISbStoryData | null> => {
    const SYSTEM_SLUG_PREFIXES = ['.well-known', 'favicon.ico', 'robots.txt', 'sitemap.xml'];

    if (SYSTEM_SLUG_PREFIXES.some((prefix) => slugPath.startsWith(prefix))) {
      return null;
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
        console.warn(
          `Storyblok Bridge: DTO validation rejected for slug [${slugPath}]. Error: ${result.error}`,
        );
        return null;
      }

      return result.data as unknown as ISbStoryData;
    } catch (error) {
      console.warn(
        `Storyblok Bridge: Upstream fetch failed for slug [${slugPath}]. Error: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
      return null;
    }
  },
);

export const generateMetadata = async ({ params }: DynamicPageProps): Promise<Metadata> => {
  const { slug } = await params;
  const slugPath = resolveSlugPath(slug);
  const { isEnabled: isDraft } = await draftMode();

  const story = await fetchDynamicStory(slugPath, isDraft);

  if (!story?.content) {
    return {
      title: 'The Job Applicant Perspective',
      description: 'Documenting the applicant timeline and market dynamics.',
    };
  }

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

  const story = await fetchDynamicStory(slugPath, isDraft);

  if (!story) {
    notFound();
  }

  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="bg-background relative flex w-full flex-grow flex-col focus:outline-none"
    >
      <section
        aria-label={`${story.name || 'Dynamic'} Page Content`}
        className="container mx-auto h-full w-full flex-grow px-4 py-12 md:px-8 lg:px-12"
      >
        <StoryblokStory story={story} />
      </section>
    </main>
  );
};

export default DynamicPage;
