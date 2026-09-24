// app/page.tsx
import { getStoryblokApi, StoryblokStory } from '@storyblok/react/rsc';
import type { ISbStoryData } from '@storyblok/react';

// Isolated Layout Components
import { MainHeader } from '@/components/MainHeader';
import { HeroSection } from '@/components/HeroSection';
import { TabbedInterface } from '@/components/TabbedInterface';
import { LocalJobsGrid } from '@/components/LocalJobsGrid';
import { MissionBanner } from '@/components/MissionBanner';
import { BlogGrid } from '@/components/BlogGrid';
import { MainFooter } from '@/components/MainFooter';

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
      <main className="bg-background relative flex min-h-screen w-full flex-col">
        <MainHeader />
        <div className="flex min-h-[50vh] w-full flex-grow flex-col items-center justify-center p-8 text-center">
          <h1 className="text-2xl font-bold text-[var(--error)]" role="alert">
            CMS Connection Pending
          </h1>
          <p className="mt-4 max-w-md text-[var(--foreground)]">
            The headless content bridge is currently inactive. Please configure your environment
            variables to initialize the data source.
          </p>
        </div>
        <MainFooter />
      </main>
    );
  }

  // 4. Core Layout Architecture
  // The layout wrapper provides the structural DOM, while Storyblok populates dynamic CMS blocks.
  return (
    <main className="bg-background relative flex min-h-screen w-full flex-col">
      <MainHeader />

      <section aria-label="Home Page Content" className="h-full w-full flex-grow">
        {/* Hardcoded Layout Regions (Migrate to Storyblok Registry if content requires frequent CMS updates) */}
        <HeroSection />

        <div className="container mx-auto px-4 md:px-8 lg:px-12">
          <div className="w-full">
            <div className="mx-auto mt-[-26px] flex w-full items-center justify-center gap-4">
              <TabbedInterface />
            </div>
          </div>
          <LocalJobsGrid />
        </div>

        <MissionBanner />
        <BlogGrid />

        {/* CMS-Driven Dynamic Regions */}
        <StoryblokStory story={story} />
      </section>

      <MainFooter />
    </main>
  );
};

export default Home;
