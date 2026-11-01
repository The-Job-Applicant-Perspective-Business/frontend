import React from 'react';

export interface BaseInputProps {
  label?: string;
  error?: string;
  id: string;
  name: string;
}

export type FormInputProps = BaseInputProps &
  (
    | ({ type: 'textarea' } & React.TextareaHTMLAttributes<HTMLTextAreaElement>)
    | ({
        type?: Exclude<React.HTMLInputTypeAttribute, 'textarea'>;
      } & React.InputHTMLAttributes<HTMLInputElement>)
  );

export const FormInput = React.forwardRef<HTMLInputElement | HTMLTextAreaElement, FormInputProps>(
  (
    {
      label,
      error,
      id,
      name,
      type = 'text',
      className = '',
      placeholder,
      disabled,
      required,
      ...props
    },
    ref,
  ) => {
    const baseInputStyles =
      'w-full rounded-md border border-border bg-background px-4 py-2 text-foreground ' +
      'placeholder:text-muted-foreground transition-colors ' +
      'focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-focus-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background ' +
      'disabled:cursor-not-allowed disabled:opacity-60 ' +
      (error ? 'border-red-600 focus-visible:ring-red-600' : '');

    const hasError = Boolean(error);
    const errorId = `${id}-error`;

    return (
      <div className="flex w-full flex-col gap-1.5">
        {label && (
          <label htmlFor={id} className="text-foreground text-sm font-semibold">
            {label}
            {required && (
              <span className="ml-1 text-red-600" aria-hidden="true">
                *
              </span>
            )}
          </label>
        )}

        {type === 'textarea' ? (
          <textarea
            ref={ref as React.ForwardedRef<HTMLTextAreaElement>}
            id={id}
            name={name}
            placeholder={placeholder}
            disabled={disabled}
            required={required}
            aria-invalid={hasError ? 'true' : undefined}
            aria-describedby={hasError ? errorId : undefined}
            rows={4}
            className={`${baseInputStyles} ${className}`.trim()}
            {...(props as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
          />
        ) : (
          <input
            ref={ref as React.ForwardedRef<HTMLInputElement>}
            type={type}
            id={id}
            name={name}
            placeholder={placeholder}
            disabled={disabled}
            required={required}
            aria-invalid={hasError ? 'true' : undefined}
            aria-describedby={hasError ? errorId : undefined}
            className={`${baseInputStyles} ${className}`.trim()}
            {...(props as React.InputHTMLAttributes<HTMLInputElement>)}
          />
        )}

        {error && (
          <span id={errorId} role="alert" className="text-xs font-medium text-red-600">
            {error}
          </span>
        )}
      </div>
    );
  },
);

FormInput.displayName = 'FormInput';

export default FormInput;
