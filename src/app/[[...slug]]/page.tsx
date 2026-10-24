import type { Metadata } from 'next';
import { draftMode } from 'next/headers';
import { notFound } from 'next/navigation';
import { getStoryblokApi, StoryblokStory } from '@storyblok/react/rsc';
import type { ISbStoryData } from '@storyblok/react';
import { initStoryblok } from '@/lib/storyblok';
import { sanitizeStoryPayload } from '@/lib/dto/sanitizeStoryPayload';

export const dynamic = 'force-dynamic';

type DynamicPageProps = {
  params: Promise<{ slug?: string[] }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
};

const resolveSlugPath = (slug?: string[]): string => {
  return slug && slug.length > 0 ? slug.join('/') : 'home';
};

const fetchDynamicStory = async (
  slugPath: string,
  isDraft: boolean,
): Promise<ISbStoryData | null> => {
  try {
    initStoryblok();
    const storyblokApi = getStoryblokApi();
    const { data } = await storyblokApi.get(`cdn/stories/${slugPath}`, {
      version: isDraft ? 'draft' : 'published',
      cv: isDraft ? Date.now() : undefined,
      resolve_relations: '',
    });

    if (!data?.story) {
      return null;
    }

    // Pass through strict DTO sanitization boundary before returning to React Server Components
    const sanitized = sanitizeStoryPayload(data.story);
    return sanitized as unknown as ISbStoryData;
  } catch (error) {
    console.warn(
      `Storyblok Bridge: Payload absent or rejected for slug [${slugPath}].` +
        (error ? ` Error: ${error}` : ''),
    );
    return null;
  }
};

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
    <div className="bg-background relative flex w-full flex-grow flex-col">
      <section
        aria-label={`${story.name || 'Dynamic'} Page Content`}
        className="container mx-auto h-full w-full flex-grow px-4 py-12 md:px-8 lg:px-12"
      >
        <StoryblokStory story={story} />
      </section>
    </div>
  );
};

export default DynamicPage;
