import React from 'react';

export interface RichTextContentProps extends React.HTMLAttributes<HTMLDivElement> {
  htmlContent: string;
  className?: string;
}

export const RichTextContent = React.forwardRef<HTMLDivElement, RichTextContentProps>(
  ({ htmlContent, className = '', ...props }, ref) => {
    // Base typography styles mapped to CSS-first @theme tokens
    const typographyStyles =
      'prose max-w-none text-foreground ' +
      'prose-headings:text-foreground prose-headings:font-bold ' +
      'prose-p:text-foreground/90 prose-p:leading-relaxed ' +
      'prose-a:text-primary prose-a:font-semibold prose-a:no-underline hover:prose-a:text-primary-light hover:prose-a:underline ' +
      'prose-a:focus-visible:outline-none prose-a:focus-visible:ring-3 prose-a:focus-visible:ring-focus-ring prose-a:focus-visible:ring-offset-2 ' +
      'prose-strong:text-foreground prose-strong:font-bold ' +
      'prose-code:text-primary-dark prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md ' +
      'prose-blockquote:border-l-border prose-blockquote:text-muted-foreground ' +
      'prose-li:text-foreground/90';

    return (
      <div
        ref={ref}
        className={`rich-text-content ${typographyStyles} ${className}`.trim()}
        dangerouslySetInnerHTML={{ __html: htmlContent }}
        {...props}
      />
    );
  },
);

RichTextContent.displayName = 'RichTextContent';

export default RichTextContent;
