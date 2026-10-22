import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export interface HeroSectionProps extends React.HTMLAttributes<HTMLElement> {
  headline?: string;
  description?: string;
  ctaText?: string;
  ctaHref?: string;
  onCtaClick?: () => void;
  className?: string;
}

const DEFAULT_HEADLINE = 'Skip the Recruitment Scams. Find What’s Real.';
const DEFAULT_DESCRIPTION =
  'Fight fake jobs and recruitment scams for your fellow job seekers with your fellow job ' +
  'seekers. Anonymous crowdsourced "Google Reviews" of job ads across the U.S. ' +
  'organized by company, job title, region, and date.';

export const HeroSection = React.forwardRef<HTMLElement, HeroSectionProps>(
  (
    {
      headline = DEFAULT_HEADLINE,
      description = DEFAULT_DESCRIPTION,
      ctaText,
      ctaHref,
      onCtaClick,
      className = '',
      ...props
    },
    ref,
  ) => {
    const isExternal =
      Boolean(ctaHref) && (ctaHref!.startsWith('http://') || ctaHref!.startsWith('https://'));

    return (
      <section
        ref={ref}
        aria-labelledby="hero-heading"
        className={`border-border bg-muted w-full border-b ${className}`.trim()}
        {...props}
      >
        <div className="mx-auto flex w-full max-w-5xl flex-col items-center justify-center px-4 py-16 text-center sm:px-6 md:py-20 lg:px-8 lg:py-24">
          <div className="w-full max-w-3xl">
            <h1
              id="hero-heading"
              className="text-foreground text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl lg:text-6xl lg:leading-tight"
            >
              {headline}
            </h1>
            <p className="text-muted-foreground mt-4 text-base font-normal sm:text-lg lg:text-xl">
              {description}
            </p>

            {ctaText && (ctaHref || onCtaClick) && (
              <div className="mt-8 flex flex-wrap justify-center gap-4">
                {ctaHref ? (
                  <Link
                    href={ctaHref}
                    target={isExternal ? '_blank' : undefined}
                    rel={isExternal ? 'noopener noreferrer' : undefined}
                    onClick={onCtaClick}
                    className="focus-visible:outline-none"
                  >
                    <Button variant="primary" size="lg">
                      {ctaText}
                      {isExternal && <span className="sr-only"> (opens in a new tab)</span>}
                    </Button>
                  </Link>
                ) : (
                  <Button variant="primary" size="lg" onClick={onCtaClick}>
                    {ctaText}
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </section>
    );
  },
);

HeroSection.displayName = 'HeroSection';

export default HeroSection;
