import React from 'react';
import Link, { LinkProps } from 'next/link';
import { ChevronRight } from 'lucide-react';

export interface JobLinkCardProps
  extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkProps>, LinkProps {
  title: string;
  href: string;
  isExternal?: boolean;
  className?: string;
}

export const JobLinkCard = React.forwardRef<HTMLAnchorElement, JobLinkCardProps>(
  ({ title, href, isExternal = true, className = '', target, rel, ...props }, ref) => {
    const finalTarget = target ?? (isExternal ? '_blank' : undefined);
    const finalRel = rel ?? (finalTarget === '_blank' ? 'noopener noreferrer' : undefined);

    return (
      <Link
        ref={ref}
        href={href}
        target={finalTarget}
        rel={finalRel}
        className={`group border-border bg-background hover:border-primary focus-visible:ring-focus-ring focus-visible:ring-offset-background flex min-h-20 w-full items-center justify-between rounded-xl border p-4 shadow-xs transition-all duration-200 hover:shadow-md focus-visible:ring-3 focus-visible:ring-offset-2 focus-visible:outline-none ${className}`.trim()}
        {...props}
      >
        <h3 className="text-foreground group-hover:text-primary text-base font-medium transition-colors md:text-lg">
          {title}
          {finalTarget === '_blank' && <span className="sr-only"> (opens in a new tab)</span>}
        </h3>

        <div className="flex shrink-0 items-center justify-center pl-2">
          <ChevronRight
            className="text-muted-foreground group-hover:bg-primary flex h-8 w-8 items-center justify-center rounded-full p-1 transition-all duration-200 group-hover:text-white"
            aria-hidden="true"
          />
        </div>
      </Link>
    );
  },
);

JobLinkCard.displayName = 'JobLinkCard';

export default JobLinkCard;
