import React from 'react';
import Image from 'next/image';

export interface PromoBannerProps extends React.HTMLAttributes<HTMLDivElement> {
  mobileImageSrc?: string;
  desktopImageSrc?: string;
  altText?: string;
  className?: string;
}

const DEFAULT_MOBILE_IMG =
  'https://a.storyblok.com/f/297007/350x180/ce6abffb96/3-free-posts-mobile.png';
const DEFAULT_DESKTOP_IMG =
  'https://a.storyblok.com/f/297007/1220x160/299b41e887/3-free-posts-desktop.png';
const DEFAULT_ALT = 'First 3 job posts free — Saving employers money by saving job seekers time.';

export const PromoBanner = React.forwardRef<HTMLDivElement, PromoBannerProps>(
  (
    {
      mobileImageSrc = DEFAULT_MOBILE_IMG,
      desktopImageSrc = DEFAULT_DESKTOP_IMG,
      altText = DEFAULT_ALT,
      className = '',
      ...props
    },
    ref,
  ) => {
    return (
      <aside
        ref={ref}
        aria-label="Promotional Announcement"
        className={`mb-14 w-full md:mb-20 ${className}`.trim()}
        {...props}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="border-border/40 relative w-full overflow-hidden rounded-xl border shadow-sm">
            {/* Mobile Viewport Asset (350x180 aspect) */}
            <div className="block w-full md:hidden">
              <Image
                src={mobileImageSrc}
                alt={altText}
                width={350}
                height={180}
                sizes="100vw"
                className="h-auto w-full object-cover"
                loading="lazy"
              />
            </div>

            {/* Desktop Viewport Asset (1220x160 aspect) */}
            <div className="hidden w-full md:block">
              <Image
                src={desktopImageSrc}
                alt={altText}
                width={1220}
                height={160}
                sizes="(min-width: 1280px) 1220px, 100vw"
                className="h-auto w-full object-cover"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </aside>
    );
  },
);

PromoBanner.displayName = 'PromoBanner';

export default PromoBanner;
