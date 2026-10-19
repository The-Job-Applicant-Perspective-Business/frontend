import { notFound } from 'next/navigation';
import { getStoryblokApi, StoryblokStory } from '@storyblok/react/rsc';
import type { ISbStoryData } from '@storyblok/react';
import { initStoryblok } from '@/lib/storyblok';

export const dynamic = 'force-dynamic';

const fetchDynamicStory = async (slugPath: string): Promise<ISbStoryData | null> => {
  try {
    initStoryblok();
    const storyblokApi = getStoryblokApi();
    const { data } = await storyblokApi.get(`cdn/stories/${slugPath}`, {
      version: process.env.NODE_ENV === 'development' ? 'draft' : 'published',
      resolve_relations: '',
    });

    return data.story;
  } catch (error) {
    console.warn(
      `Storyblok Bridge: Payload absent or rejected for slug [${slugPath}].` +
        (error ? ` Error: ${error}` : ''),
    );
    return null;
  }
};

type DynamicPageProps = {
  params: Promise<{ slug?: string[] }>;
};

const DynamicPage = async ({ params }: DynamicPageProps) => {
  const resolvedParams = await params;
  const slugPath = resolvedParams.slug ? resolvedParams.slug.join('/') : 'home';

  const story = await fetchDynamicStory(slugPath);

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
