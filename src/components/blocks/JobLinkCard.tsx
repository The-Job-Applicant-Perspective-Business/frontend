import React from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

export interface JobLinkCardProps {
  title: string;
  href: string;
  isExternal?: boolean;
  className?: string;
}

export const JobLinkCard = ({
  title,
  href,
  isExternal = true,
  className = '',
}: JobLinkCardProps) => {
  return (
    <Link
      href={href}
      target={isExternal ? '_blank' : undefined}
      rel={isExternal ? 'noopener noreferrer' : undefined}
      className={`group border-border bg-background hover:border-primary focus-visible:ring-focus-ring focus-visible:ring-offset-background flex min-h-20 w-full items-center justify-between rounded-xl border p-4 shadow-sm transition-all duration-200 hover:shadow-md focus-visible:ring-3 focus-visible:ring-offset-2 focus-visible:outline-none ${className}`.trim()}
    >
      <h3 className="text-foreground group-hover:text-primary text-base font-medium transition-colors md:text-lg">
        {title}
        {isExternal && <span className="sr-only"> (opens in a new tab)</span>}
      </h3>

      <div className="flex shrink-0 items-center justify-center pl-2">
        <ChevronRight
          className="text-muted-foreground group-hover:bg-primary flex h-8 w-8 items-center justify-center rounded-full p-1 transition-all duration-200 group-hover:text-white"
          aria-hidden="true"
        />
      </div>
    </Link>
  );
};

export default JobLinkCard;
