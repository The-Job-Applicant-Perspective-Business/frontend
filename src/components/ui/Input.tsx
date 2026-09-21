import React, { useId } from "react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, id, className = "", required, "aria-invalid": ariaInvalid, ...props }, ref) => {
    // 1. Auto-generate a unique ID if the developer forgets to pass one (Section 508 Failsafe)
    const generatedId = useId();
    const inputId = id || generatedId;
    const errorId = `${inputId}-error`;
    
    // 2. Bind the CSS error state directly to the component's logic
    const isInvalid = !!error || ariaInvalid === "true" || ariaInvalid === true;

    return (
      <div className="flex w-full flex-col gap-1.5">
        {/* WCAG 3.3.2: Explicit labels bound to the input ID */}
        <label htmlFor={inputId} className="text-sm font-semibold text-[var(--foreground)]">
          {label} {required && <span aria-hidden="true" className="text-[var(--error)]">*</span>}
        </label>
        
        <input
          ref={ref}
          id={inputId}
          required={required}
          aria-invalid={isInvalid ? "true" : "false"}
          aria-describedby={error ? errorId : undefined}
          className={`flex h-10 w-full rounded-md border border-gray-300 bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-gray-500 transition-colors focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-[var(--focus-ring)] ${className}`}
          {...props}
        />
        
        {/* SC 4.1.3: Status messages must be programmatically associated and announced */}
        {error && (
          <span id={errorId} role="alert" className="text-sm font-medium text-[var(--error)]">
            {error}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";