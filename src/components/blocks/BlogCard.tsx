import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

export interface BlogCardProps {
  imageSrc?: string;
  imageAlt?: string;
  metaText: string;
  title: string;
  description: string;
  href?: string;
  tags?: string[];
  className?: string;
}

export const BlogCard = ({
  imageSrc,
  imageAlt = '',
  metaText,
  title,
  description,
  href,
  tags = [],
  className = '',
}: BlogCardProps) => {
  // Validate presence of image source to prevent next/image runtime crashes
  const hasValidImage = typeof imageSrc === 'string' && imageSrc.trim().length > 0;

  const CardContent = (
    <>
      {/* Aspect ratio container locks layout dimensions and prevents CLS */}
      <div className="bg-muted border-border/40 relative aspect-16/10 w-full overflow-hidden rounded-t-xl border-b">
        {hasValidImage ? (
          <Image
            src={imageSrc}
            alt={imageAlt}
            aria-hidden={imageAlt === '' ? 'true' : undefined}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          /* Zero-Trust Fallback: Branded placeholder when image asset is missing */
          <div
            aria-hidden="true"
            className="from-muted via-accent-bg/20 to-muted flex h-full w-full items-center justify-center bg-gradient-to-br"
          >
            <svg
              className="text-muted-foreground/30 h-12 w-12"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
              />
            </svg>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-6">
        <span className="text-muted-foreground mb-2 text-xs font-bold tracking-wider uppercase">
          {metaText}
        </span>
        <h3 className="text-foreground group-hover:text-primary mb-3 text-xl font-bold transition-colors">
          {title}
        </h3>
        <p className="text-muted-foreground mb-4 line-clamp-3 flex-1 text-sm leading-relaxed">
          {description}
        </p>

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2">
            {tags.map((tag, index) => (
              <span
                key={`${tag}-${index}`}
                className="bg-accent-bg text-accent-text inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </>
  );

  const containerClasses =
    `group flex flex-col w-full overflow-hidden rounded-xl border border-border bg-background shadow-sm transition-all duration-200 hover:shadow-md ${className}`.trim();

  if (href) {
    return (
      <Link
        href={href}
        className={`${containerClasses} focus-visible:ring-focus-ring focus-visible:ring-offset-background focus-visible:ring-3 focus-visible:ring-offset-2 focus-visible:outline-none`}
      >
        {CardContent}
      </Link>
    );
  }

  return <div className={containerClasses}>{CardContent}</div>;
};

export default BlogCard;
