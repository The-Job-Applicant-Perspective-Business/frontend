import React, { useId } from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  wrapperClassName?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      id,
      className = '',
      wrapperClassName = '',
      required,
      disabled,
      'aria-invalid': ariaInvalid,
      ...props
    },
    ref,
  ) => {
    // 1. Unique ID Generation (WCAG 3.3.2 / Section 508 programmatic binding)
    const generatedId = useId();
    const inputId = id || generatedId;
    const errorId = `${inputId}-error`;

    // 2. Unified Validation Flag
    const isInvalid = Boolean(error) || ariaInvalid === 'true' || ariaInvalid === true;

    // 3. Structural Tokenization mapped to Tailwind CSS v4 globals.css
    const baseInputStyles =
      'flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm text-foreground transition-colors ' +
      'placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-offset-2 focus-visible:ring-offset-background ' +
      'disabled:cursor-not-allowed disabled:opacity-60';

    const stateStyles = isInvalid
      ? 'border-red-600 focus-visible:ring-red-600'
      : 'border-border focus-visible:ring-focus-ring';

    return (
      <div className={`flex w-full flex-col gap-1.5 ${wrapperClassName}`.trim()}>
        <label htmlFor={inputId} className="text-foreground text-sm font-semibold select-none">
          {label}
          {required && (
            <span aria-hidden="true" className="ml-1 text-red-600">
              *
            </span>
          )}
        </label>

        <input
          ref={ref}
          id={inputId}
          required={required}
          disabled={disabled}
          aria-invalid={isInvalid ? 'true' : 'false'}
          aria-describedby={error ? errorId : undefined}
          className={`${baseInputStyles} ${stateStyles} ${className}`.trim()}
          {...props}
        />

        {error && (
          <span id={errorId} role="alert" className="text-sm font-medium text-red-600">
            {error}
          </span>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';
