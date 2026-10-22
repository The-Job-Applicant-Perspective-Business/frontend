import React from 'react';
import { JobLinkCard } from '@/components/blocks/JobLinkCard';

export interface LocalJobItem {
  title: string;
  href: string;
}

export interface LocalJobsGridProps extends React.HTMLAttributes<HTMLElement> {
  heading?: string;
  jobs?: LocalJobItem[];
  className?: string;
}

const DEFAULT_JOBS: readonly LocalJobItem[] = [
  { title: 'MyMichigan Health', href: 'https://careers.mymichigan.org/jobs' },
  { title: 'Greater Midland Jobs', href: 'https://www.greatermidland.org/jobs' },
  { title: 'Midland Public Schools', href: 'https://www.midlandps.org/district-employment' },
  { title: 'Midland ESA Jobs', href: 'https://www.midlandesa.org/page/employment' },
  { title: 'Midland Business Alliance Jobs', href: 'https://business.mbami.org/jobs' },
  { title: 'Meridian Public Schools Jobs', href: 'https://www.applitrack.com/merps/onlineapp/' },
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
        className={`mb-24 w-full ${className}`.trim()}
        {...props}
      >
        <h2
          id="local-jobs-heading"
          className="text-foreground text-center text-3xl leading-tight font-semibold md:text-4xl"
        >
          {heading}
        </h2>

        <div className="mt-12 grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {jobs.map((job) => (
            <JobLinkCard key={`${job.title}-${job.href}`} title={job.title} href={job.href} />
          ))}
        </div>
      </section>
    );
  },
);

LocalJobsGrid.displayName = 'LocalJobsGrid';

export default LocalJobsGrid;
