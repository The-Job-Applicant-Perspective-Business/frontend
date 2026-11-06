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
  href: string;
  subtitle: string;
}

export interface BlogGridProps extends React.HTMLAttributes<HTMLElement> {
  title?: string;
  heading?: string;
  description?: string;
  viewAllHref?: string;
  posts?: BlogItem[];
  className?: string;
}

// Pass empty strings so missing local files trigger the SVG placeholder
const DEFAULT_POSTS: BlogItem[] = [
  {
    title: 'Building the Future of Job Searching: Explore Our Growing Research Archive',
    author: 'Sarah Springsteen Trumble',
    date: 'July 23, 2025',
    imageSrc: '',
    tags: [],
    href: '/job-insights/building-the-future',
    subtitle: 'How We Advocate Academically For Paradigm Shift',
  },
  {
    title: 'Our Research: Unpacking the Hidden Forces Shaping Modern Labor Markets',
    author: 'Sarah Springsteen Trumble',
    date: 'July 19, 2025',
    imageSrc: '',
    tags: ['New Tech', 'New World', 'Research'],
    href: '/job-insights/why-online-hiring-fails',
    subtitle: 'A New Theory Why Online Hiring Fails Job Seekers',
  },
  {
    title: 'The Case Concerning Legalized Job Scraping',
    author: 'Jay Jones',
    date: 'May 30, 2025',
    imageSrc: '',
    tags: [],
    href: '/job-insights/scratching-the-surface',
    subtitle: 'What is it, and why is it allowed?',
  },
];

export const BlogGrid = ({
  title = 'Job search intel and insights',
  heading,
  description = 'Wondering what others face? Explore anonymous stories from job seekers like you. Get a dose of reality, laugh, connect, and gain valuable insights on your path to landing your dream job!',
  viewAllHref = '/job-insights',
  posts = DEFAULT_POSTS,
  className = '',
  ...props
}: BlogGridProps) => {
  const displayHeading = heading || title;

  return (
    <section
      aria-labelledby="blog-grid-heading"
      className={`px-gutter py-section mx-auto w-full max-w-7xl ${className}`.trim()}
      {...props}
    >
      <div className="mb-12 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end md:gap-8">
        <div className="w-full md:w-1/2">
          <h2
            id="blog-grid-heading"
            className="text-foreground leading-tight font-semibold text-[var(--text-fluid-3xl)]"
          >
            {displayHeading}
          </h2>
        </div>

        <div className="w-full md:w-1/2">
          <p className="text-muted-foreground leading-relaxed text-[var(--text-fluid-lg)]">
            {description}
          </p>

          <Link
            href={viewAllHref}
            className="group focus-visible:ring-focus-ring mt-4 inline-flex items-center gap-2 rounded-md py-2 text-base font-bold focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
          >
            <span className="text-primary group-hover:underline">
              Read all
              <span className="sr-only"> articles and insights</span>
            </span>
            <span
              aria-hidden="true"
              className="text-primary transition-transform group-hover:translate-x-1"
            >
              &rarr;
            </span>
          </Link>
        </div>
      </div>

      <div className="gap-gutter grid grid-cols-[repeat(auto-fit,minmax(min(100%,20rem),1fr))]">
        {posts.map((post) => (
          <BlogCard
            key={post.id || post.title}
            imageSrc={post.imageSrc}
            imageAlt={post.title}
            metaText={`${post.author} • ${post.date}`}
            title={post.title}
            description={post.subtitle}
            href={post.href}
            tags={post.tags}
          />
        ))}
      </div>
    </section>
  );
};

export default BlogGrid;
