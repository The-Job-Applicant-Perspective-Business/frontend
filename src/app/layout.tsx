import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import StoryblokProvider from '@/components/StoryblokProvider';
import './globals.css';
import Link from 'next/link';

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
};

export const metadata: Metadata = {
  title: {
    default: 'The Job Applicant Perspective',
    template: '%s | The Job Applicant Perspective',
  },
  description: 'Anonymous crowdsourced reviews and systems analysis for the modern job market.',
  metadataBase: new URL('https://thejobapplicantperspective.com'),
};

interface RootLayoutProps {
  children: React.ReactNode;
}

const RootLayout = ({ children }: RootLayoutProps) => {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-[var(--background)] font-sans text-[var(--foreground)]">
        {/* WCAG 2.2 SC 2.4.1: Skip to Main Content Bypass Block */}
        <Link
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-md focus:bg-[var(--primary)] focus:px-4 focus:py-2 focus:text-white focus:outline-none focus-visible:ring-3 focus-visible:ring-[var(--focus-ring)]"
        >
          Skip to main content
        </Link>

        <StoryblokProvider>
          <div className="flex min-h-screen flex-col">
            <main id="main-content" className="flex-grow">
              {children}
            </main>
          </div>
        </StoryblokProvider>
      </body>
    </html>
  );
};

export default RootLayout;
