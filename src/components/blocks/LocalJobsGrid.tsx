import React from 'react';
import { JobLinkCard } from '@/components/blocks/JobLinkCard';

export interface LocalJobItem {
  title: string;
  href: string;
  isExternal?: boolean;
}

export interface LocalJobsGridProps extends React.HTMLAttributes<HTMLElement> {
  heading?: string;
  jobs?: LocalJobItem[];
  className?: string;
}

const DEFAULT_JOBS: readonly LocalJobItem[] = [
  { title: 'MyMichigan Health', href: 'https://careers.mymichigan.org/jobs', isExternal: true },
  { title: 'Greater Midland Jobs', href: 'https://www.greatermidland.org/jobs', isExternal: true },
  {
    title: 'Midland Public Schools',
    href: 'https://www.midlandps.org/district-employment',
    isExternal: true,
  },
  {
    title: 'Midland ESA Jobs',
    href: 'https://www.midlandesa.org/page/employment',
    isExternal: true,
  },
  {
    title: 'Midland Business Alliance Jobs',
    href: 'https://business.mbami.org/jobs',
    isExternal: true,
  },
  {
    title: 'Meridian Public Schools Jobs',
    href: 'https://www.applitrack.com/merps/onlineapp/',
    isExternal: true,
  },
];

export const LocalJobsGrid = React.forwardRef<HTMLElement, LocalJobsGridProps>(
  (
    {
      heading = 'For more local jobs and opportunities visit',
      jobs = DEFAULT_JOBS,
      className = '',
      ...props
    },
    ref,
  ) => {
    return (
      <section
        ref={ref}
        aria-labelledby="local-jobs-heading"
        className={`px-gutter py-section mx-auto w-full max-w-7xl ${className}`.trim()}
        {...props}
      >
        <h2
          id="local-jobs-heading"
          className="text-foreground text-center leading-tight font-semibold tracking-tight text-[var(--text-fluid-2xl)] md:text-[var(--text-fluid-3xl)]"
        >
          {heading}
        </h2>

        {/* Fluid intrinsic auto-fit grid prevents discrete breakpoint snapping */}
        <div className="gap-card-gap mt-8 grid w-full grid-cols-[repeat(auto-fit,minmax(min(100%,18rem),1fr))]">
          {jobs.map((job) => (
            <JobLinkCard
              key={`${job.title}-${job.href}`}
              title={job.title}
              href={job.href}
              isExternal={job.isExternal ?? true}
            />
          ))}
        </div>
      </section>
    );
  },
);

LocalJobsGrid.displayName = 'LocalJobsGrid';

export default LocalJobsGrid;
