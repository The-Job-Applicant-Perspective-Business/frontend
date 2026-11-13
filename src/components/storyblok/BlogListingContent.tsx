'use client';

import React, { useState, useMemo } from 'react';
import { storyblokEditable } from '@storyblok/react';
import type { SbBlokData } from '@storyblok/react';
import { BlogCard } from '@/components/blocks/BlogCard';

const CATEGORY_FILTERS = [
  'All',
  'New Tech',
  'New World',
  'Research',
  'Rethinking Hiring',
  'Changing Careers',
  'Fake Profiles',
  'Question / Answer',
  'Using Our Platform',
  'Legal Rights',
  'ATS',
];

interface StoryblokArticleItem {
  _uid?: string;
  id?: number | string;
  name?: string;
  slug?: string;
  title?: string;
  Title?: string;
  Heading?: string;
  SubHeading?: string;
  subtitle?: string;
  description?: string;
  Description?: string;
  WrittenBy?: string;
  Author?: string;
  published_at?: string;
  date?: string;
  first_published_at?: string;
  tag_list?: string[];
  tags?: string[];
  category?: string;
  Image?: { filename?: string; alt?: string };
  image?: { filename?: string; alt?: string };
  content?: {
    Image?: { filename?: string; alt?: string };
    Heading?: string;
    SubHeading?: string;
    WrittenBy?: string;
    tag_list?: string[];
  };
  [key: string]: unknown;
}

export interface BlogListingContentProps {
  blok: {
    _uid: string;
    _editable?: string;
    Title?: string;
    Heading?: string;
    Description?: string;
    Subheading?: string;
    Articles?: StoryblokArticleItem[];
    body?: SbBlokData[];
    [key: string]: unknown;
  };
}

// Fallback articles populated from live space telemetry
const DEFAULT_LISTING_ARTICLES: StoryblokArticleItem[] = [
  {
    _uid: 'live-art-01',
    slug: 'building-the-future-of-job-searching-academically',
    Title: 'Building the Future of Job Searching: Explore Our Growing Research Archive',
    SubHeading: 'How We Advocate Academically For Paradigm Shift',
    WrittenBy: 'Sarah Springsteen Trumble',
    date: 'July 23, 2025',
    tags: ['Research', 'Rethinking Hiring'],
    Image: {
      filename:
        'https://a.storyblok.com/f/297007/1024x1024/277aa5e3cf/chatgpt-image-jul-23-2025-03_48_08-pm.png',
    },
  },
  {
    _uid: 'live-art-02',
    slug: 'Why-online-hiring-fails-job-seekers',
    Title: 'Our Research: Unpacking the Hidden Forces Shaping Modern Labor Markets',
    SubHeading: 'A New Theory Why Online Hiring Fails Job Seekers',
    WrittenBy: 'Sarah Springsteen Trumble',
    date: 'July 19, 2025',
    tags: ['New Tech', 'New World', 'Research'],
    Image: {
      filename:
        'https://a.storyblok.com/f/297007/1024x1536/9c69c2c92c/chatgpt-image-jul-19-2025-09_55_26-am.png',
    },
  },
  {
    _uid: 'live-art-03',
    slug: 'scratching-the-surface-job-scraping-is-legal-what-it-results-in-isn-t-',
    Title: 'The Case Concerning Legalized Job Scraping',
    SubHeading: 'What is it, and why is it allowed?',
    WrittenBy: 'Jay Jones',
    date: 'May 30, 2025',
    tags: ['Legal Rights', 'ATS'],
    Image: {
      filename: 'https://a.storyblok.com/f/297007/6912x3456/af5f9f318f/job-scraping.png',
    },
  },
  {
    _uid: 'live-art-04',
    slug: 'the-job-market-s-trust-problemand-why-it-s-costing-everyone',
    Title: 'The Job Market’s Trust Problem—and Why It’s Costing Everyone',
    SubHeading: 'Why reputational transparency is the missing infrastructure in hiring.',
    WrittenBy: 'Sarah Trumble',
    date: 'April 8, 2025',
    tags: ['Rethinking Hiring', 'Research'],
    Image: {
      filename:
        'https://a.storyblok.com/f/297007/1024x1024/1d70502f7c/chatgpt-image-apr-8-2025-05_32_03-pm.png',
    },
  },
  {
    _uid: 'live-art-05',
    slug: 'the-casino-theory-of-modern-hiring',
    Title: 'The Casino Theory of Modern Hiring',
    SubHeading: 'How algorithmic ATS engines monetize candidate friction and uncertainty.',
    WrittenBy: 'Sarah Springsteen Trumble',
    date: 'November 15, 2024',
    tags: ['ATS', 'Research'],
    Image: {
      filename:
        'https://a.storyblok.com/f/297007/1024x1024/277aa5e3cf/chatgpt-image-jul-23-2025-03_48_08-pm.png',
    },
  },
  {
    _uid: 'live-art-06',
    slug: 'why-ghost-jobs-are-so-prevalent-and-profitable',
    Title: 'Why Ghost Jobs are So Prevalent and Profitable',
    SubHeading: 'Analyzing the business model behind listings that never intend to hire.',
    WrittenBy: 'Sarah Springsteen Trumble',
    date: 'November 14, 2024',
    tags: ['Fake Profiles', 'ATS'],
    Image: {
      filename:
        'https://a.storyblok.com/f/297007/1024x1536/9c69c2c92c/chatgpt-image-jul-19-2025-09_55_26-am.png',
    },
  },
];

const ITEMS_PER_PAGE = 6;

export const BlogListingContent: React.FC<BlogListingContentProps> = ({ blok }) => {
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [currentPage, setCurrentPage] = useState<number>(1);

  const pageTitle = blok.Heading || blok.Title || 'Job search intel and insights';
  const pageDescription =
    blok.Description ||
    blok.Subheading ||
    'Wondering what others face? Explore anonymous stories from job seekers like you. Get a dose of reality, laugh, connect, and gain valuable insights on your path to landing your dream job!';

  // Normalize incoming articles from CMS or fallback
  const allArticles = useMemo(() => {
    const source =
      blok.Articles && blok.Articles.length > 0 ? blok.Articles : DEFAULT_LISTING_ARTICLES;

    return source.map((item) => {
      const title =
        item.Heading ||
        item.Title ||
        item.title ||
        item.name ||
        item.content?.Heading ||
        'Untitled Investigation';

      const description =
        item.SubHeading ||
        item.description ||
        item.Description ||
        item.subtitle ||
        item.content?.SubHeading ||
        '';

      const author =
        item.WrittenBy || item.Author || item.content?.WrittenBy || 'Sarah Springsteen Trumble';

      const rawDate =
        item.date || item.published_at || item.first_published_at || 'Recently Published';

      const formattedDate =
        rawDate.includes('T') || rawDate.includes('-')
          ? new Date(rawDate).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })
          : rawDate;

      const imageSrc =
        item.Image?.filename ||
        item.image?.filename ||
        (typeof item.image === 'string' ? item.image : '') ||
        item.content?.Image?.filename ||
        '';

      const tags = item.tags || item.tag_list || item.content?.tag_list || ['Research'];

      const slug = item.slug || '';

      return {
        id: item._uid || item.id || slug,
        title,
        description,
        author,
        date: formattedDate,
        imageSrc,
        tags,
        slug,
      };
    });
  }, [blok.Articles]);

  // Filter articles based on active pill
  const filteredArticles = useMemo(() => {
    if (activeCategory === 'All') return allArticles;
    return allArticles.filter((art) =>
      art.tags.some((t) => t.toLowerCase() === activeCategory.toLowerCase()),
    );
  }, [allArticles, activeCategory]);

  const totalPages = Math.max(1, Math.ceil(filteredArticles.length / ITEMS_PER_PAGE));

  const paginatedArticles = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredArticles.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredArticles, currentPage]);

  const handleCategorySelect = (category: string) => {
    setActiveCategory(category);
    setCurrentPage(1);
  };

  return (
    <article {...storyblokEditable(blok)} className="relative w-full bg-white">
      {/* 1. Header Banner matching live HTML */}
      <div className="layout-background h-full w-full border-b-[1px] border-b-[#9CABC7] px-[5vw]">
        <div className="bg-transparent pt-[71.5px] md:pt-[125px] lg:pt-[124px]">
          <div className="mt-[30px] mb-[24px] flex flex-col gap-[8px] md:mb-[64px] lg:mt-[64px] lg:flex-row lg:gap-[5vw]">
            <h1 className="w-full text-[24px] font-semibold text-[#121212] sm:text-[32px] md:text-[48px] md:leading-[62px]">
              {pageTitle}
            </h1>
            <p className="flex items-center justify-center text-[14px] leading-[24px] font-[400] text-[#434343] md:text-[16px]">
              {pageDescription}
            </p>
          </div>
        </div>
      </div>

      {/* 2. Main Listing Section */}
      <section className="px-[5vw]">
        {/* Category Filters Row */}
        <ul
          aria-label="Filter articles by category"
          className="my-[32px] flex scrollbar-none gap-[8px] overflow-x-auto pb-2 md:overflow-hidden"
        >
          {CATEGORY_FILTERS.map((cat) => {
            const isActive = activeCategory === cat;
            return (
              <li key={cat} className="list-none">
                <button
                  type="button"
                  onClick={() => handleCategorySelect(cat)}
                  className={`focus-visible:ring-primary min-w-fit cursor-pointer rounded-full px-4 py-1.5 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none ${
                    isActive
                      ? 'bg-primary text-[#FAFAFA]'
                      : 'text-[#7C7C7C] hover:bg-slate-100 hover:text-[#121212]'
                  }`}
                >
                  {cat}
                </button>
              </li>
            );
          })}
        </ul>

        {/* 3. Responsive Card Grid (1 col mobile, 2 col tablet, 3 col desktop) */}
        <div className="mb-[80px] grid grid-cols-1 gap-x-[32px] gap-y-[24px] md:grid-cols-2 lg:grid-cols-3">
          {paginatedArticles.length > 0 ? (
            paginatedArticles.map((article) => (
              <BlogCard
                key={article.id}
                title={article.title}
                description={article.description}
                author={article.author}
                date={article.date}
                imageSrc={article.imageSrc}
                slug={article.slug}
                tags={article.tags}
              />
            ))
          ) : (
            <div className="col-span-full py-16 text-center text-[#7C7C7C]">
              No articles currently indexed under the &quot;{activeCategory}&quot; category.
            </div>
          )}
        </div>

        {/* 4. Pagination Controls matching live DOM */}
        {totalPages > 1 && (
          <nav aria-label="Pagination Navigation" className="my-[60px] md:my-[80px]">
            <div className="mt-4 flex items-center justify-center gap-2 text-[13px] font-[600]">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className={`px-3 py-1 text-[#434343] transition-colors ${
                  currentPage === 1 ? 'invisible' : 'hover:text-primary cursor-pointer'
                }`}
              >
                Previous
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
                const isCurrent = pageNum === currentPage;
                return (
                  <button
                    key={pageNum}
                    type="button"
                    onClick={() => setCurrentPage(pageNum)}
                    aria-current={isCurrent ? 'page' : undefined}
                    className={`flex h-[32px] w-[32px] cursor-pointer items-center justify-center rounded-[8px] border p-[10px] text-[13px] font-[600] transition-colors ${
                      isCurrent
                        ? 'border-primary bg-primary text-white'
                        : 'hover:border-primary border-[#E8E8E8] bg-white text-black'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                type="button"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className={`px-3 py-1 text-[#434343] transition-colors ${
                  currentPage === totalPages ? 'invisible' : 'hover:text-primary cursor-pointer'
                }`}
              >
                Next
              </button>
            </div>
          </nav>
        )}
      </section>
    </article>
  );
};

export default BlogListingContent;
