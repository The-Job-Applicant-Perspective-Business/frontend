import React, { useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export interface BlogCardProps {
  imageSrc?: string;
  imageAlt?: string;
  metaText?: string;
  author?: string;
  date?: string;
  category?: string;
  title: string;
  description: string;
  href?: string;
  slug?: string;
  tags?: string[];
  featured?: boolean;
  className?: string;
}

export const BlogCard: React.FC<BlogCardProps> = ({
  imageSrc,
  imageAlt = '',
  metaText,
  author,
  date,
  category,
  title,
  description,
  href,
  slug,
  tags = [],
  className = '',
}) => {
  const hasValidImage = typeof imageSrc === 'string' && imageSrc.trim().length > 0;

  // Build the meta string (e.g., "Sarah Springsteen Trumble • July 23, 2025")
  const displayMeta = useMemo(() => {
    if (metaText) return metaText;
    if (author && date) return `${author} • ${date}`;
    if (category && date) return `${category} • ${date}`;
    return author || date || category || '';
  }, [metaText, author, date, category]);

  // Standardize href resolution to enforce canonical /job-insights/[slug]
  const targetHref = useMemo(() => {
    const rawLink = href || slug;
    if (!rawLink) return undefined;

    if (rawLink.startsWith('http://') || rawLink.startsWith('https://')) {
      return rawLink;
    }

    const cleanSlug = rawLink
      .replace(/^\/+/, '')
      .replace(/^blog\//, '')
      .replace(/^job-insights\//, '');

    return `/job-insights/${cleanSlug}`;
  }, [href, slug]);

  const CardContent = (
    <div className="w-full cursor-pointer">
      {/* 1. Image Container (240px fixed height matching live design) */}
      <div className="relative h-[240px] w-full overflow-hidden rounded-[14px] bg-[#F4F6F8]">
        {hasValidImage ? (
          <Image
            src={imageSrc}
            alt={imageAlt || title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 380px"
            className="h-[240px] w-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div
            aria-hidden="true"
            className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200"
          >
            <svg
              className="h-12 w-12 text-slate-300"
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

      {/* 2. Metadata Tag Line */}
      {displayMeta && (
        <h6 className="text-primary mt-[32px] text-[14px] font-[600]">{displayMeta}</h6>
      )}

      {/* 3. Title */}
      <h3 className="group-hover:text-primary mt-[12px] text-[24px] leading-[32px] font-[600] text-[#434343] transition-colors">
        {title}
      </h3>

      {/* 4. Description / Subtitle */}
      <p className="mt-[12px] line-clamp-2 min-h-[48px] text-[16px] leading-[24px] font-[400] text-[#7C7C7C]">
        {description}
      </p>

      {/* 5. Footer: Tags + Read More */}
      <div className="mt-[24px] flex flex-col gap-[24px] md:flex-row md:items-center md:justify-between md:gap-[32px]">
        <ul className="hide-scrollbar flex w-full flex-wrap gap-[6px] overflow-x-auto">
          {tags.map((tag, index) => (
            <li
              key={`${tag}-${index}`}
              className="min-w-fit rounded-[16px] bg-[#EEF4FF] px-[10px] py-[2px] text-[14px] font-[500] text-[#3538CD]"
            >
              {tag}
            </li>
          ))}
        </ul>

        <div className="text-primary flex shrink-0 items-center gap-1.5">
          <span className="text-[16px] leading-[24px] font-[700]">Read more</span>
          <span
            aria-hidden="true"
            className="font-bold transition-transform group-hover:translate-x-1"
          >
            &gt;
          </span>
        </div>
      </div>
    </div>
  );

  const containerClasses =
    `group flex flex-col w-full text-left transition-all duration-200 ${className}`.trim();

  if (targetHref) {
    return (
      <Link
        href={targetHref}
        className={`${containerClasses} focus-visible:ring-primary rounded-[14px] focus-visible:ring-3 focus-visible:ring-offset-2 focus-visible:outline-none`}
      >
        {CardContent}
      </Link>
    );
  }

  return <div className={containerClasses}>{CardContent}</div>;
};

export default BlogCard;
