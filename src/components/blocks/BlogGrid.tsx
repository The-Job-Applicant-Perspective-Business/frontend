import React from 'react';
import Link from 'next/link';
import { BlogCard } from '@/components/blocks/BlogCard';

export interface BlogItem {
  id?: string;
  title: string;
  author: string;
  date: string;
  imageSrc?: string;
  tags: string[];
  href?: string;
  slug?: string;
  subtitle: string;
}

export interface BlogGridProps extends React.HTMLAttributes<HTMLElement> {
  title?: string;
  heading?: string;
  description?: string;
  viewAllHref?: string;
  posts?: BlogItem[];
  limit?: number;
  className?: string;
}

// Live production default posts matching Storyblok records
const DEFAULT_POSTS: BlogItem[] = [
  {
    title: 'Building the Future of Job Searching: Explore Our Growing Research Archive',
    author: 'Sarah Springsteen Trumble',
    date: 'July 23, 2025',
    imageSrc:
      'https://a.storyblok.com/f/297007/1024x1024/277aa5e3cf/chatgpt-image-jul-23-2025-03_48_08-pm.png',
    tags: ['Research', 'Rethinking Hiring'],
    slug: 'building-the-future-of-job-searching-academically',
    subtitle: 'How We Advocate Academically For Paradigm Shift',
  },
  {
    title: 'Our Research: Unpacking the Hidden Forces Shaping Modern Labor Markets',
    author: 'Sarah Springsteen Trumble',
    date: 'July 19, 2025',
    imageSrc:
      'https://a.storyblok.com/f/297007/1024x1536/9c69c2c92c/chatgpt-image-jul-19-2025-09_55_26-am.png',
    tags: ['New Tech', 'New World', 'Research'],
    slug: 'Why-online-hiring-fails-job-seekers',
    subtitle: 'A New Theory Why Online Hiring Fails Job Seekers',
  },
  {
    title: 'The Case Concerning Legalized Job Scraping',
    author: 'Jay Jones',
    date: 'May 30, 2025',
    imageSrc: 'https://a.storyblok.com/f/297007/6912x3456/af5f9f318f/job-scraping.png',
    tags: ['Legal Rights', 'ATS'],
    slug: 'scratching-the-surface-job-scraping-is-legal-what-it-results-in-isn-t-',
    subtitle: 'What is it, and why is it allowed?',
  },
];

export const BlogGrid: React.FC<BlogGridProps> = ({
  title = 'Job search intel and insights',
  heading,
  description = 'Wondering what others face? Explore anonymous stories from job seekers like you. Get a dose of reality, laugh, connect, and gain valuable insights on your path to landing your dream job!',
  viewAllHref = '/job-insights',
  posts = DEFAULT_POSTS,
  limit,
  className = '',
  ...props
}) => {
  const displayHeading = heading || title;
  const displayedPosts = limit ? posts.slice(0, limit) : posts;

  return (
    <section
      aria-labelledby="blog-grid-heading"
      className={`w-full px-[5vw] py-[64px] md:py-[130px] ${className}`.trim()}
      {...props}
    >
      {/* 1. Header Row */}
      <div className="flex flex-col items-center justify-between gap-x-16 md:flex-row">
        <div className="w-full md:max-w-1/2">
          <h2
            id="blog-grid-heading"
            className="mt-[24px] text-[32px] leading-[41px] font-[600] text-[#121212] md:mt-0 md:text-[48px] md:leading-[62px]"
          >
            {displayHeading}
          </h2>
        </div>

        <div className="w-full md:max-w-1/2">
          <p className="mt-[8px] text-[16px] text-[#7C7C7C] md:mt-0">{description}</p>

          <Link
            href={viewAllHref}
            className="group text-primary focus-visible:ring-primary mt-[14px] flex items-center gap-[4px] rounded-sm focus-visible:ring-2 focus-visible:outline-none"
          >
            <span className="text-[16px] leading-[24px] font-[700] text-[#0D3276] group-hover:underline">
              Read all
            </span>
            <span aria-hidden="true" className="transition-transform group-hover:translate-x-1">
              &rarr;
            </span>
          </Link>
        </div>
      </div>

      {/* 2. Responsive 3-Column Grid */}
      <div className="mt-[40px] md:mt-[64px]">
        <div className="grid grid-cols-1 gap-x-[32px] gap-y-[24px] md:grid-cols-2 lg:grid-cols-3">
          {displayedPosts.map((post) => (
            <BlogCard
              key={post.id || post.slug || post.title}
              title={post.title}
              description={post.subtitle}
              author={post.author}
              date={post.date}
              imageSrc={post.imageSrc}
              slug={post.slug}
              href={post.href}
              tags={post.tags}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default BlogGrid;
