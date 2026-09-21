import { getStoryblokApi, StoryblokStory } from '@storyblok/react/rsc';
import type { ISbStoryData } from '@storyblok/react';

// 1. Enforce cache invalidation for dynamic draft environments
export const dynamic = 'force-dynamic';

const fetchHomeStory = async (): Promise<ISbStoryData | null> => {
  try {
    const storyblokApi = getStoryblokApi();

    // 2. Fetch the root "home" story, pivoting based on environment
    const { data } = await storyblokApi.get('cdn/stories/home', {
      version: process.env.NODE_ENV === 'development' ? 'draft' : 'published',
      resolve_relations: '',
    });

    return data.story;
  } catch (error) {
    console.error('Storyblok Bridge Error: Payload failed to compile.', error);
    return null;
  }
};

const Home = async () => {
  const story = await fetchHomeStory();

  // 3. Feral Grit Mandate: Improvise a safe fallback if the CMS bridge is down
  if (!story) {
    return (
      <div className="flex min-h-[50vh] w-full flex-col items-center justify-center p-8 text-center">
        <h1 className="text-2xl font-bold text-[var(--error)]" role="alert">
          CMS Connection Pending
        </h1>
        <p className="mt-4 max-w-md text-[var(--foreground)]">
          The headless content bridge is currently inactive. Please configure your environment
          variables to initialize the data source.
        </p>
      </div>
    );
  }

  // 4. layout.tsx provides the <main> wrapper.
  return (
    <section aria-label="Home Page Content" className="w-full">
      <StoryblokStory story={story} />
    </section>
  );
};

export default Home;
