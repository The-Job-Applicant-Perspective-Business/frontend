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
        className={`container mx-auto px-4 py-12 md:px-8 md:py-16 lg:px-12 ${className}`.trim()}
        {...props}
      >
        <h2
          id="local-jobs-heading"
          className="text-foreground text-center text-3xl leading-tight font-semibold tracking-tight md:text-4xl"
        >
          {heading}
        </h2>

        <div className="mt-8 grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
