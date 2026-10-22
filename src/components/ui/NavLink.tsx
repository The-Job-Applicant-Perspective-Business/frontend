import React from 'react';
import Link, { LinkProps } from 'next/link';

export interface NavLinkProps
  extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkProps>, LinkProps {
  children: React.ReactNode;
  variant?: 'standard' | 'muted' | 'footer';
  className?: string;
}

export const NavLink = React.forwardRef<HTMLAnchorElement, NavLinkProps>(
  ({ href, children, variant = 'standard', className = '', target, rel, ...props }, ref) => {
    const isExternal =
      typeof href === 'string' && (href.startsWith('http://') || href.startsWith('https://'));

    const finalTarget = target ?? (isExternal ? '_blank' : undefined);
    const finalRel = rel ?? (finalTarget === '_blank' ? 'noopener noreferrer' : undefined);

    const baseStyles =
      'inline-flex items-center gap-1.5 font-medium transition-colors ' +
      'focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-focus-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background ' +
      'rounded-md';

    const variantStyles = {
      standard: 'text-foreground hover:text-primary',
      muted: 'text-muted-foreground hover:text-foreground',
      footer: 'text-xs text-muted-foreground hover:text-foreground',
    };

    return (
      <Link
        ref={ref}
        href={href}
        target={finalTarget}
        rel={finalRel}
        className={`${baseStyles} ${variantStyles[variant]} ${className}`.trim()}
        {...props}
      >
        {children}
        {finalTarget === '_blank' && <span className="sr-only"> (opens in a new tab)</span>}
      </Link>
    );
  },
);

NavLink.displayName = 'NavLink';

export default NavLink;
