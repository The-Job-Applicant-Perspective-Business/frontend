import React from "react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "primary", disabled, "aria-disabled": ariaDisabled, children, ...props }, ref) => {
    // 1. Unified Disabled State: Catches both HTML disabled and ARIA disabled
    const isDisabled = disabled || ariaDisabled === "true" || ariaDisabled === true;

    // 2. Base styles map to the CSS variables defined in global.css
    const baseStyles = "inline-flex items-center justify-center rounded-md px-4 py-2 font-semibold transition-colors focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-[var(--focus-ring)] disabled:pointer-events-none disabled:opacity-60";
    
    const variants = {
      primary: "bg-[var(--primary)] text-white hover:bg-opacity-90",
      secondary: "bg-gray-200 text-[var(--foreground)] hover:bg-gray-300",
      outline: "border-2 border-[var(--primary)] text-[var(--primary)] hover:bg-gray-50",
    };

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        aria-disabled={isDisabled ? "true" : "false"}
        className={`${baseStyles} ${variants[variant]} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";