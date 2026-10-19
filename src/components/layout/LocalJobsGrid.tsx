// components/LocalJobsGrid.tsx
import { ChevronRight } from 'lucide-react';
import Link from 'next/link';

interface JobCardProps {
  title: string;
  href: string;
}

const LocalJobCard = ({ title, href }: JobCardProps) => {
  return (
    <Link
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group bg-background hover:border-primary focus-visible:ring-focus-ring flex min-h-20 w-full items-center justify-between rounded-xl border-2 border-transparent p-4 shadow-sm transition-all duration-200 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
    >
      <h3 className="text-foreground text-lg font-medium md:text-xl">
        {title}
        <span className="sr-only"> (opens in a new tab)</span>
      </h3>
      <div className="flex items-center justify-center">
        <ChevronRight
          className="text-muted-foreground group-hover:bg-primary flex h-8 w-8 shrink-0 items-center justify-center rounded-full p-1 transition-all duration-200 group-hover:text-white"
          aria-hidden="true"
        />
      </div>
    </Link>
  );
};

export const LocalJobsGrid = () => {
  const jobs = [
    { title: 'MyMichigan Health', href: 'https://careers.mymichigan.org/jobs' },
    { title: 'Greater Midland Jobs', href: 'https://www.greatermidland.org/jobs' },
    { title: 'Midland Public Schools', href: 'https://www.midlandps.org/district-employment' },
    { title: 'Midland ESA Jobs', href: 'https://www.midlandesa.org/page/employment' },
    { title: 'Midland Business Alliance Jobs', href: 'https://business.mbami.org/jobs' },
    { title: 'Meridian Public Schools Jobs', href: 'https://www.applitrack.com/merps/onlineapp/' },
  ];

  return (
    <section aria-labelledby="local-jobs-heading" className="mb-24 w-full">
      <h2
        id="local-jobs-heading"
        className="text-foreground text-center text-3xl leading-tight font-semibold md:text-4xl"
      >
        For more local jobs and opportunities visit
      </h2>
      <div className="mt-12 grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {jobs.map((job) => (
          <LocalJobCard key={job.title} title={job.title} href={job.href} />
        ))}
      </div>
    </section>
  );
};

export default LocalJobsGrid;
