import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import Link from 'next/link';
import StoryblokProvider from '@/components/storyblok/StoryblokProvider';
import { MainHeader } from '@/components/layout/MainHeader';
import { MainFooter } from '@/components/layout/MainFooter';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
  display: 'swap',
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
  display: 'swap',
});

export const viewport: Viewport = {
  themeColor: '#0D3276',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: {
    default: 'The Job Applicant Perspective',
    template: '%s | The Job Applicant Perspective',
  },
  description: 'Anonymous crowdsourced reviews and systems analysis for the modern job market.',
  metadataBase: new URL('https://thejobapplicantperspective.com'),
  alternates: {
    canonical: '/',
  },
  robots: {
    index: true,
    follow: true,
  },
};

interface RootLayoutProps {
  children: React.ReactNode;
}

const RootLayout = ({ children }: RootLayoutProps) => {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="bg-background text-foreground flex min-h-full flex-col font-sans">
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
            {/* Primary Main Landmark - Universal across all routes */}
            <main
              id="main-content"
              tabIndex={-1}
              className="flex flex-grow flex-col focus:outline-none"
            >
              {children}
            </main>
            <MainFooter />
          </div>
        </StoryblokProvider>
      </body>
    </html>
  );
};

export default RootLayout;
