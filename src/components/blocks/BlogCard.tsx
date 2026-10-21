import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

export interface BlogCardProps {
  imageSrc: string;
  metaText: string;
  title: string;
  description: string;
  href?: string;
  tags?: string[];
  className?: string;
}

export const BlogCard = ({
  imageSrc,
  metaText,
  title,
  description,
  href,
  tags = [],
  className = '',
}: BlogCardProps) => {
  const CardContent = (
    <>
      <div className="bg-muted relative h-48 w-full overflow-hidden">
        <Image
          src={imageSrc}
          alt=""
          aria-hidden="true"
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>
      <div className="flex flex-1 flex-col p-6">
        <span className="text-muted-foreground mb-2 text-xs font-bold tracking-wider uppercase">
          {metaText}
        </span>
        <h3 className="text-foreground group-hover:text-primary mb-3 text-xl font-bold transition-colors">
          {title}
        </h3>
        <p className="text-muted-foreground mb-4 line-clamp-3 flex-1 text-sm">{description}</p>
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
