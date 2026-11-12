import React from 'react';
import Link from 'next/link';
import { storyblokEditable, StoryblokComponent, renderRichText } from '@storyblok/react';
import type { SbBlokData, SbRichTextDoc } from '@storyblok/react';
import { Calendar, MapPin, Clock, ExternalLink, ArrowRight, Tag } from 'lucide-react';

interface EventItem {
  _uid: string;
  title?: string;
  Title?: string;
  description?: string;
  Description?: string;
  date?: string;
  Date?: string;
  time?: string;
  Time?: string;
  location?: string;
  Location?: string;
  isVirtual?: boolean;
  IsVirtual?: boolean;
  link?: string;
  Link?: string;
  url?: string;
  category?: string;
  Category?: string;
  type?: string;
  [key: string]: unknown;
}

export interface EventDirectoryContentProps {
  blok: {
    _uid: string;
    _editable?: string;
    Title?: string;
    Heading?: string;
    Subtitle?: string;
    Description?: string;
    Introduction?: string | SbRichTextDoc;
    Events?: EventItem[];
    Items?: EventItem[];
    body?: SbBlokData[];
    [key: string]: unknown;
  };
}

const sanitizeHref = (rawUrl?: string): string | null => {
  if (!rawUrl || typeof rawUrl !== 'string') return null;
  const trimmed = rawUrl.trim();
  if (!trimmed || trimmed === '#') return null;
  if (trimmed.startsWith('/') || trimmed.startsWith('https://') || trimmed.startsWith('http://')) {
    return trimmed;
  }
  return null;
};

export const EventDirectoryContent: React.FC<EventDirectoryContentProps> = ({ blok }) => {
  const pageTitle = blok.Heading || blok.Title || 'Career Fairs & Hiring Events';
  const pageSubtitle =
    blok.Subtitle ||
    blok.Description ||
    'Regional and virtual hiring fairs, networking events, and employer access opportunities.';

  const rawEvents = blok.Events || blok.Items || [];

  const renderIntro = (): React.ReactNode => {
    if (!blok.Introduction) return null;

    const rawHtml =
      typeof blok.Introduction === 'string'
        ? blok.Introduction
        : renderRichText(blok.Introduction) || '';

    if (!rawHtml) return null;

    return (
      <div
        className="prose prose-slate prose-headings:text-[#0d3276] prose-a:text-[#0d3276] prose-a:underline hover:prose-a:text-[#081F48] max-w-none text-base leading-relaxed text-[#434343]"
        dangerouslySetInnerHTML={{ __html: rawHtml }}
      />
    );
  };

  return (
    <div
      {...storyblokEditable(blok)}
      data-testid="storyblok-event-directory-container"
      className="min-h-screen w-full bg-[#ffffff] text-[#434343]"
    >
      {/* Top Header Clearance Bar matching BlogArticleContent canonical layout */}
      <div
        className="h-[70px] w-full border-b border-[#9CABC7] bg-[#ffffff] lg:h-[124px]"
        aria-hidden="true"
      />

      <article className="mx-auto flex w-full max-w-7xl flex-col px-4 py-12 sm:px-6 md:py-16 lg:px-8">
        {/* 1. Directory Header Landmark */}
        <section
          aria-labelledby="event-directory-heading"
          className="mb-10 flex flex-col items-start border-b border-slate-200 pb-8 text-left md:mb-14"
        >
          <span className="mb-3 inline-flex items-center gap-1.5 text-xs font-bold tracking-wider text-[#0d3276] uppercase">
            <Calendar className="h-3.5 w-3.5 text-[#0d3276]" aria-hidden="true" />
            Hiring Opportunities &amp; Fair Directory
          </span>
          <h1
            id="event-directory-heading"
            className="text-3xl font-bold tracking-tight text-[#0d3276] sm:text-4xl lg:text-5xl"
          >
            {pageTitle}
          </h1>
          {pageSubtitle && (
            <p className="mt-4 max-w-3xl text-lg leading-relaxed text-[#434343] sm:text-xl">
              {pageSubtitle}
            </p>
          )}
          {blok.Introduction && <div className="mt-6 max-w-3xl">{renderIntro()}</div>}
        </section>

        {/* 2. Events Grid */}
        <section aria-label="Scheduled Hiring Events" className="w-full">
          {rawEvents.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
              {rawEvents.map((event) => {
                const eventTitle = event.Title || event.title || 'Upcoming Career Fair';
                const eventDescription = event.Description || event.description || '';
                const eventDate = event.Date || event.date;
                const eventTime = event.Time || event.time;
                const eventLocation = event.Location || event.location || 'Virtual / Online';
                const eventCategory =
                  event.Category || event.category || event.type || 'Hiring Event';
                const safeHref = sanitizeHref(event.Link || event.link || event.url);
                const isVirtual =
                  event.isVirtual !== undefined
                    ? event.isVirtual
                    : event.IsVirtual !== undefined
                      ? event.IsVirtual
                      : eventLocation.toLowerCase().includes('virtual') ||
                        eventLocation.toLowerCase().includes('online');

                const isExternal =
                  safeHref !== null &&
                  (safeHref.startsWith('http://') || safeHref.startsWith('https://'));

                return (
                  <div
                    key={event._uid}
                    className="group flex w-full flex-col justify-between rounded-xl border border-slate-200 bg-[#ffffff] p-6 shadow-sm transition-all duration-200 hover:border-[#0d3276]/50 hover:shadow-md"
                  >
                    <div className="flex flex-col">
                      <div className="mb-3 flex items-center justify-between gap-2">
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold tracking-wider text-[#434343] uppercase">
                          <Tag className="h-3.5 w-3.5 text-[#0d3276]" aria-hidden="true" />
                          {eventCategory}
                        </span>
                        {isVirtual && (
                          <span className="rounded-full bg-[#0d3276]/10 px-2.5 py-0.5 text-xs font-semibold text-[#0d3276]">
                            Virtual
                          </span>
                        )}
                      </div>

                      <h2 className="mb-3 text-xl font-bold text-[#0d3276] transition-colors group-hover:text-[#081F48]">
                        {eventTitle}
                      </h2>

                      {/* Event Metadata: Date, Time, Location */}
                      <dl className="mb-4 space-y-2 text-xs text-[#434343]">
                        {eventDate && (
                          <div className="flex items-center gap-2">
                            <dt className="sr-only">Date</dt>
                            <Calendar
                              className="h-3.5 w-3.5 shrink-0 text-[#0d3276]"
                              aria-hidden="true"
                            />
                            <dd>{eventDate}</dd>
                          </div>
                        )}
                        {eventTime && (
                          <div className="flex items-center gap-2">
                            <dt className="sr-only">Time</dt>
                            <Clock
                              className="h-3.5 w-3.5 shrink-0 text-[#0d3276]"
                              aria-hidden="true"
                            />
                            <dd>{eventTime}</dd>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <dt className="sr-only">Location</dt>
                          <MapPin
                            className="h-3.5 w-3.5 shrink-0 text-[#0d3276]"
                            aria-hidden="true"
                          />
                          <dd>{eventLocation}</dd>
                        </div>
                      </dl>

                      {eventDescription && (
                        <p className="line-clamp-4 text-sm leading-relaxed text-[#434343]">
                          {eventDescription}
                        </p>
                      )}
                    </div>

                    <div className="mt-6 border-t border-slate-200 pt-4">
                      {safeHref ? (
                        isExternal ? (
                          <Link
                            href={safeHref}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`Register or view details for ${eventTitle} (opens in a new tab)`}
                            className="group/link inline-flex items-center gap-1.5 rounded-sm text-sm font-semibold text-[#0d3276] underline-offset-4 hover:text-[#081F48] hover:underline focus-visible:ring-2 focus-visible:ring-[#0d3276] focus-visible:ring-offset-2 focus-visible:outline-none"
                          >
                            <span>Register / Details</span>
                            <ExternalLink
                              className="h-4 w-4 transition-transform group-hover/link:translate-x-0.5"
                              aria-hidden="true"
                            />
                          </Link>
                        ) : (
                          <Link
                            href={safeHref}
                            aria-label={`View event details for ${eventTitle}`}
                            className="group/link inline-flex items-center gap-1.5 rounded-sm text-sm font-semibold text-[#0d3276] underline-offset-4 hover:text-[#081F48] hover:underline focus-visible:ring-2 focus-visible:ring-[#0d3276] focus-visible:ring-offset-2 focus-visible:outline-none"
                          >
                            <span>View Event</span>
                            <ArrowRight
                              className="h-4 w-4 transition-transform group-hover/link:translate-x-0.5"
                              aria-hidden="true"
                            />
                          </Link>
                        )
                      ) : (
                        <span className="text-xs font-medium text-slate-500">
                          Registration link pending
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div
              role="status"
              className="flex min-h-64 w-full flex-col items-center justify-center rounded-xl border border-slate-200 bg-slate-50 p-8 text-center"
            >
              <p className="text-base font-medium text-[#434343]">
                No upcoming career fairs or events cataloged at this time.
              </p>
            </div>
          )}
        </section>

        {/* 3. Modular Storyblok Blok Extension */}
        {blok.body && blok.body.length > 0 && (
          <div className="mt-12 flex w-full flex-col gap-8 md:mt-16">
            {blok.body.map((nestedBlok) => (
              <StoryblokComponent blok={nestedBlok} key={nestedBlok._uid} />
            ))}
          </div>
        )}
      </article>
    </div>
  );
};

export default EventDirectoryContent;
