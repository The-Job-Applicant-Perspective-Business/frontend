import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className = '',
      variant = 'primary',
      size = 'md',
      type = 'button',
      disabled,
      'aria-disabled': ariaDisabled,
      children,
      ...props
    },
    ref,
  ) => {
    // 1. Unified Disabled Boundary (Captures DOM and ARIA disabled states)
    const isDisabled = disabled || ariaDisabled === 'true' || ariaDisabled === true;

    // 2. Base Structural Styles mapped to Tailwind CSS v4 @theme tokens
    const baseStyles =
      'inline-flex items-center justify-center rounded-md font-semibold transition-colors duration-150 select-none ' +
      'focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-focus-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background ' +
      'disabled:pointer-events-none disabled:opacity-60';

    // 3. Sizing Matrix (Ensures WCAG 2.2 Target Size SC 2.5.8 minimums)
    const sizeStyles = {
      sm: 'px-3 py-1.5 text-sm min-h-8',
      md: 'px-4 py-2 text-base min-h-10',
      lg: 'px-6 py-3 text-lg min-h-12',
    };

    // 4. Semantic Color Variants bound to globals.css tokens
    const variantStyles = {
      primary: 'bg-primary text-white hover:bg-primary-light active:bg-primary-dark',
      secondary: 'bg-accent-bg text-accent-text hover:bg-primary-light/10 border border-border',
      outline:
        'bg-transparent border-2 border-primary text-primary hover:bg-accent-bg active:bg-primary/10',
    };

    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        aria-disabled={isDisabled ? 'true' : 'false'}
        className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`.trim()}
        {...props}
      >
        {children}
      </button>
    );
  },
);

Button.displayName = 'Button';
