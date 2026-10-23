import React from 'react';
import Link from 'next/link';

export interface GoBackButtonProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  label: string;
  href?: string;
  className?: string;
}

export const GoBackButton = React.forwardRef<HTMLAnchorElement, GoBackButtonProps>(
  ({ label, href = '/job-insights', className = '', ...props }, ref) => {
    return (
      <Link
        ref={ref}
        href={href}
        className={`group text-muted-foreground hover:text-foreground focus-visible:ring-focus-ring focus-visible:ring-offset-background inline-flex min-h-8 cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium transition-colors focus-visible:ring-3 focus-visible:ring-offset-2 focus-visible:outline-none ${className}`.trim()}
        {...props}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
          className="transition-transform duration-150 group-hover:-translate-x-1"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10 19l-7-7m0 0l7-7m-7 7h18"
          />
        </svg>
        <span>{label}</span>
      </Link>
    );
  },
);

GoBackButton.displayName = 'GoBackButton';

export default GoBackButton;
