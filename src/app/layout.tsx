import type { Metadata, Viewport } from 'next';
import { Jost, Manrope } from 'next/font/google';
import './globals.css';

const jost = Jost({
  variable: '--font-jost',
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  display: 'swap',
});

const manrope = Manrope({
  variable: '--font-manrope',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
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
      className={`${jost.variable} ${manrope.variable} h-full antialiased`}
    >
      <body className="bg-background text-foreground flex min-h-full flex-col font-sans">
        {children}
      </body>
    </html>
  );
};

export default RootLayout;
