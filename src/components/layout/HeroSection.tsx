import React from 'react';
import { Button } from '@/components/ui/Button';

export interface HeroSectionProps {
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

export const HeroSection = ({
  headline = DEFAULT_HEADLINE,
  description = DEFAULT_DESCRIPTION,
  ctaText,
  ctaHref,
  onCtaClick,
  className = '',
}: HeroSectionProps) => {
  return (
    <section
      aria-labelledby="hero-heading"
      className={`border-border bg-muted w-full border-b ${className}`.trim()}
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
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => {
                    if (onCtaClick) onCtaClick();
                    window.location.href = ctaHref;
                  }}
                >
                  {ctaText}
                </Button>
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
};

export default HeroSection;
