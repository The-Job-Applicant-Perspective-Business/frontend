import { notFound } from 'next/navigation';
import { getStoryblokApi, StoryblokStory } from '@storyblok/react/rsc';
import type { ISbStoryData } from '@storyblok/react';

// Decoupled Structural Wrappers
import { MainHeader } from '@/components/MainHeader';
import { MainFooter } from '@/components/MainFooter';

export const dynamic = 'force-dynamic';

const fetchDynamicStory = async (slugPath: string): Promise<ISbStoryData | null> => {
  try {
    const storyblokApi = getStoryblokApi();
    const { data } = await storyblokApi.get(`cdn/stories/${slugPath}`, {
      version: process.env.NODE_ENV === 'development' ? 'draft' : 'published',
      resolve_relations: '',
    });

    return data.story;
  } catch (error) {
    // Tier 1 Remediation: Prevent error boundary hemorrhage on invalid slugs/404s
    console.warn(
      `Storyblok Bridge: Payload absent or rejected for slug [${slugPath}].` +
        (error ? ` Error: ${error}` : ''),
    );
    return null;
  }
};

const DynamicPage = async ({ params }: { params: { slug: string[] } }) => {
  // Join the captured slug array into a path string (e.g., 'privacy-policy' or 'legal/terms')
  const slugPath = params.slug ? params.slug.join('/') : '';
  const story = await fetchDynamicStory(slugPath);

  // Tier 1 Remediation: Return static 404 to halt SSR processing on dead routes
  if (!story) {
    notFound();
  }

  return (
    <main className="bg-background relative flex min-h-screen w-full flex-col">
      <MainHeader />

      {/* Storyblok handles all internal component rendering based on the CMS block schema */}
      <section
        aria-label={`${story.name || 'Dynamic'} Page Content`}
        className="container mx-auto h-full w-full flex-grow px-4 py-12 md:px-8 lg:px-12"
      >
        <StoryblokStory story={story} />
      </section>

      <MainFooter />
    </main>
  );
};

export default DynamicPage;
