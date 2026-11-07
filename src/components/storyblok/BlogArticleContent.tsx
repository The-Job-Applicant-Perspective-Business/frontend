import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { renderRichText } from '@storyblok/react';
import type { ISbStoryData, SbRichTextDoc } from '@storyblok/react';
import { ChevronLeft } from 'lucide-react';

interface BlogArticleBlok {
  _uid?: string;
  component?: string;
  // Field variants matching live Storyblok space
  Heading?: string;
  heading?: string;
  Title?: string;
  title?: string;
  SubHeading?: string;
  subheading?: string;
  Subtitle?: string;
  subtitle?: string;
  WrittenBy?: string;
  written_by?: string;
  Author?: string;
  author?: string;
  Date?: string;
  date?: string;
  Category?: string;
  category?: string;
  Tag?: string;
  tag?: string;
  Image?: {
    id?: number;
    filename?: string;
    alt?: string;
  };
  image?: {
    id?: number;
    filename?: string;
    alt?: string;
  };
  Content?: SbRichTextDoc;
  content?: SbRichTextDoc;
  Body?: SbRichTextDoc;
  body?: SbRichTextDoc;
}

interface BlogArticleContentProps {
  blok: BlogArticleBlok;
  story?: ISbStoryData;
}

export const BlogArticleContent: React.FC<BlogArticleContentProps> = ({ blok, story }) => {
  // 1. Resolve Title Cascade
  const articleTitle =
    blok.Heading ||
    blok.heading ||
    blok.Title ||
    blok.title ||
    story?.name ||
    'Job Search Intel & Insights';

  // 2. Resolve Subtitle / Deck
  const articleSubtitle = blok.SubHeading || blok.subheading || blok.Subtitle || blok.subtitle;

  // 3. Resolve Author
  const authorName =
    blok.WrittenBy || blok.written_by || blok.Author || blok.author || 'Sarah Springsteen Trumble';

  // 4. Resolve Date & Formatted String
  const rawDate =
    blok.Date || blok.date || story?.first_published_at || story?.published_at || story?.created_at;

  const displayDate = rawDate
    ? new Date(rawDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'Recent Perspective';

  // 5. Category Tag / Breadcrumb Label
  const categoryTag = blok.Category || blok.category || blok.Tag || blok.tag || 'Rethinking Hiring';

  // 6. Featured Image Resolution
  const featuredImage = blok.Image?.filename || blok.image?.filename;
  const imageAlt = blok.Image?.alt || blok.image?.alt || articleTitle;

  // 7. Rich Text Document Resolution
  const richTextBody = blok.Content || blok.content || blok.Body || blok.body;
  const renderedHtml = richTextBody ? renderRichText(richTextBody) : null;

  return (
    <div className="relative w-full bg-white text-[#171717]">
      {/* Top Header Clearance Bar matching live layout */}
      <div className="layout-background h-[70px] w-full border-b-[1px] border-b-[#9CABC7] lg:h-[124px]">
        <div className="flex w-full items-center justify-center bg-transparent px-[5vw] pt-[145px] lg:pt-[124px]" />
      </div>

      {/* Main Content Manifold */}
      <section className="mx-auto w-full max-w-[88vw]">
        {/* Navigation Breadcrumb Row */}
        <div className="mt-[30px] flex w-fit items-center gap-[16px] md:mt-[63px]">
          <Link
            href="/job-insights"
            className="group focus-visible:ring-primary flex cursor-pointer items-center gap-[4px] rounded-sm focus-visible:ring-2 focus-visible:outline-none"
          >
            <ChevronLeft
              className="text-primary h-5 w-5 transition-transform duration-200 group-hover:-translate-x-1"
              aria-hidden="true"
            />
            <span className="text-primary text-[16px] font-[700]">Go back</span>
          </Link>
          <div className="hidden h-[12px] w-[1px] bg-[#8D90D5] md:flex" aria-hidden="true" />
          <div className="flex gap-1 text-[16px] font-[500] text-[#7C7C7C]">{categoryTag}</div>
        </div>

        {/* Primary Article Heading */}
        <h1 className="mt-[16px] text-[32px] leading-[44px] font-[700] text-[#434343] sm:text-[38px] sm:leading-[50px] lg:text-[48px] lg:leading-[62px]">
          {articleTitle}
        </h1>

        {/* Subheading / Academic Hook */}
        {articleSubtitle && (
          <h4 className="mt-[16px] text-[14px] font-[400] text-[#7C7C7C] md:text-[20px] md:font-[600]">
            {articleSubtitle}
          </h4>
        )}

        {/* Mobile-Only Metadata Pill */}
        <div className="mt-4 flex items-center gap-3 text-sm text-[#7C7C7C] md:hidden">
          <span>By {authorName}</span>
          <span>•</span>
          <span>{displayDate}</span>
        </div>

        {/* Hero Cover Image Container */}
        {featuredImage && (
          <div className="mt-[40px] w-full overflow-hidden rounded-[14px] bg-slate-50">
            <div className="relative aspect-16/10 max-h-[70vh] w-full">
              <Image
                src={featuredImage}
                alt={imageAlt}
                fill
                priority
                sizes="(max-width: 1200px) 100vw, 1206px"
                className="object-cover"
              />
            </div>
          </div>
        )}

        {/* Two-Column Body Grid & Sticky Sidebar */}
        <div className="mt-[40px] mb-[82px] flex flex-col justify-between gap-[28px] md:flex-row">
          {/* Main Article Prose Column */}
          <div className="w-full md:max-w-[70%]">
            <div
              className="rich-text-content prose prose-headings:font-sans prose-headings:font-[700] prose-headings:text-[#121212] prose-h2:text-[26px] prose-h2:leading-[36px] md:prose-h2:text-[32px] md:prose-h2:leading-[42px] prose-h3:text-[20px] prose-h3:leading-[30px] md:prose-h3:text-[24px] md:prose-h3:leading-[34px] prose-h4:text-[18px] prose-h4:leading-[26px] prose-p:text-[16px] prose-p:leading-[28px] prose-p:text-[#434343] prose-a:font-[600] prose-a:text-primary prose-a:underline hover:prose-a:text-primary-light prose-strong:font-[700] prose-strong:text-[#121212] prose-ul:my-4 prose-ul:list-disc prose-ul:pl-6 prose-li:text-[16px] prose-li:leading-[26px] prose-blockquote:my-6 prose-blockquote:border-l-[4px] prose-blockquote:border-primary prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-[#121212] prose-hr:my-8 prose-hr:border-[#CBD5E1] max-w-none text-[#434343]"
              dangerouslySetInnerHTML={{ __html: renderedHtml || '' }}
            />
          </div>

          {/* Sticky Author & Date Sidebar */}
          <aside
            aria-label="Article Publication Details"
            className="sticky top-[40px] hidden max-h-[400px] w-[20vw] shrink-0 rounded-[12px] border-l-[1px] border-[#CBD5E1] md:block md:pr-[20px] md:pl-[20px] lg:pr-[43px] lg:pl-[60px]"
          >
            <p className="text-[14px] font-[600] text-[#A2A2A2]">Written By</p>
            <p className="text-[16px] font-[600] text-[#7C7C7C]">{authorName}</p>

            <p className="mt-[40px] text-[14px] font-[600] text-[#A2A2A2]">POSTED ON</p>
            <p className="text-[16px] font-[600] text-[#7C7C7C]">{displayDate}</p>
          </aside>
        </div>
      </section>
    </div>
  );
};

export default BlogArticleContent;
