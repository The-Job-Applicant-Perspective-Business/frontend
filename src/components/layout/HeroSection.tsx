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
        className={`layout-background border-border w-full border-b ${className}`.trim()}
        {...props}
      >
        <div className="flex w-full items-center justify-center px-[5vw] pt-[145px] lg:pt-[124px]">
          <div className="mb-[56px] w-full max-w-[699px] text-center md:mb-[89px] lg:mt-[71px]">
            <h1
              id="hero-heading"
              className="text-foreground text-[32px] leading-[46px] font-bold tracking-[-0.02em] lg:text-[64px] lg:leading-[92px]"
            >
              {headline}
            </h1>
            <p className="text-muted-foreground mt-[8px] text-[14px] font-normal lg:text-[18px]">
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
