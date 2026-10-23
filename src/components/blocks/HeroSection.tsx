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
        className={`border-border from-accent-bg/30 via-background to-background relative w-full overflow-hidden border-b bg-gradient-to-b ${className}`.trim()}
        {...props}
      >
        {/* Atmospheric Floating Diamond Accents (Decorative Telemetry) */}
        <div
          aria-hidden="true"
          className="bg-primary/5 pointer-events-none absolute top-24 -left-12 h-48 w-48 rotate-12 rounded-3xl blur-2xl md:top-20 md:left-8 md:h-64 md:w-64"
        />
        <div
          aria-hidden="true"
          className="bg-accent-text/5 pointer-events-none absolute top-32 -right-12 h-56 w-56 -rotate-12 rounded-3xl blur-2xl md:top-24 md:right-12 md:h-72 md:w-72"
        />

        <div className="relative container mx-auto flex w-full items-center justify-center px-4 pt-32 pb-16 sm:px-6 md:pt-40 md:pb-24 lg:px-8 lg:pt-44 lg:pb-28">
          <div className="mx-auto w-full max-w-3xl text-center">
            <h1
              id="hero-heading"
              className="text-foreground text-4xl leading-tight font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:leading-none"
            >
              {headline}
            </h1>

            <p className="text-muted-foreground mx-auto mt-6 max-w-2xl text-base leading-relaxed sm:text-lg md:text-xl">
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
                    className="focus-visible:ring-focus-ring bg-primary text-primary-foreground hover:bg-primary/90 inline-flex min-h-12 items-center justify-center rounded-lg px-6 py-3 text-base font-semibold shadow-sm transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                  >
                    {ctaText}
                    {isExternal && <span className="sr-only"> (opens in a new tab)</span>}
                  </Link>
                ) : (
                  <Button variant="primary" size="lg" onClick={onCtaClick} className="min-h-12">
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
