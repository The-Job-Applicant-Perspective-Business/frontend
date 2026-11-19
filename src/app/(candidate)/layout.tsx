import Link from 'next/link';
import StoryblokProvider from '@/components/storyblok/StoryblokProvider';
import { MainHeader } from '@/components/layout/MainHeader';
import { MainFooter } from '@/components/layout/MainFooter';

interface CandidateLayoutProps {
  children: React.ReactNode;
}

const CandidateLayout = ({ children }: CandidateLayoutProps) => {
  return (
    <>
      {/* WCAG 2.2 SC 2.4.1: Accessible Skip to Content Landmark */}
      <Link
        href="#main-content"
        className="focus:bg-primary focus-visible:ring-focus-ring sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-md focus:px-4 focus:py-2 focus:text-white focus:outline-none focus-visible:ring-3"
      >
        Skip to main content
      </Link>

      <StoryblokProvider>
        <div className="flex min-h-screen flex-col">
          <MainHeader />
          {/* Primary Main Landmark - Universal fluid spacing via Tailwind v4 @theme tokens */}
          <main id="main-content" tabIndex={-1} className="w-full flex-grow focus:outline-none">
            {children}
          </main>
          <MainFooter />
        </div>
      </StoryblokProvider>
    </>
  );
};

export default CandidateLayout;
