import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export interface MissionBannerProps extends React.HTMLAttributes<HTMLElement> {
  heading?: string;
  description?: string;
  ctaText?: string;
  ctaHref?: string;
  imageSrc?: string;
  imageAlt?: string;
  className?: string;
}

const DEFAULT_HEADING = 'Unveiling our mission';
const DEFAULT_DESCRIPTION =
  'We are here to transform hiring into a two-stakeholder market. Employers may see job ' +
  'seekers as a resource, but we see them as a stakeholder whose needs we must balance ' +
  'with employers to ensure an efficient hiring process. Join us in transforming hiring.';
const DEFAULT_IMAGE = '/dall-e-2025-02-11-14-00-51-a-unique-ghost-hunting-character.jpeg';
const DEFAULT_IMAGE_ALT = 'Futuristic character illustrating the search for authentic job listings';

export const MissionBanner = React.forwardRef<HTMLElement, MissionBannerProps>(
  (
    {
      heading = DEFAULT_HEADING,
      description = DEFAULT_DESCRIPTION,
      ctaText = 'Know more',
      ctaHref = '/who-we-are',
      imageSrc = DEFAULT_IMAGE,
      imageAlt = DEFAULT_IMAGE_ALT,
      className = '',
      ...props
    },
    ref,
  ) => {
    return (
      <section
        ref={ref}
        aria-labelledby="mission-heading"
        className={`border-border from-accent-bg/40 via-background to-background w-full border-b bg-gradient-to-r ${className}`.trim()}
        {...props}
      >
        <div className="relative container mx-auto px-4 py-16 sm:px-6 md:py-20 lg:px-12 lg:py-24">
          <div className="flex flex-col items-center justify-between gap-12 md:flex-row lg:gap-16">
            {/* Visual Anchor Container */}
            <div className="relative flex w-full justify-center md:w-1/2">
              <div className="border-border/60 bg-background relative aspect-3/2 w-full max-w-lg overflow-hidden rounded-xl border shadow-sm">
                <Image
                  src={imageSrc}
                  alt={imageAlt}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover"
                  priority={false}
                />
              </div>
            </div>

            {/* Narrative Content Block */}
            <div className="flex w-full flex-col items-start md:w-1/2">
              <h2
                id="mission-heading"
                className="text-foreground text-3xl leading-tight font-semibold sm:text-4xl md:text-5xl"
              >
                {heading}
              </h2>
              <p className="text-muted-foreground mt-4 text-base leading-relaxed sm:text-lg">
                {description}
              </p>

              <Link
                href={ctaHref}
                className="group text-primary hover:text-primary-dark focus-visible:ring-focus-ring focus-visible:ring-offset-background mt-6 inline-flex min-h-12 items-center gap-2 rounded-lg px-3 py-2 transition-colors focus-visible:ring-3 focus-visible:ring-offset-2 focus-visible:outline-none"
              >
                <span className="text-base font-bold group-hover:underline">
                  {ctaText}
                  <span className="sr-only"> about our mission</span>
                </span>
                <ArrowRight
                  className="h-5 w-5 transition-transform duration-150 group-hover:translate-x-1"
                  aria-hidden="true"
                />
              </Link>
            </div>
          </div>
        </div>
      </section>
    );
  },
);

MissionBanner.displayName = 'MissionBanner';

export default MissionBanner;
