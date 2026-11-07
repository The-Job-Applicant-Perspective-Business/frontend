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

export const EventDirectoryContent: React.FC<EventDirectoryContentProps> = ({ blok }) => {
  const pageTitle = blok.Heading || blok.Title || 'Career Fairs & Hiring Events';
  const pageSubtitle =
    blok.Subtitle ||
    blok.Description ||
    'Regional and virtual hiring fairs, networking events, and employer access opportunities.';

  const rawEvents = blok.Events || blok.Items || [];

  const renderIntro = () => {
    if (!blok.Introduction) return null;

    if (typeof blok.Introduction === 'string') {
      return (
        <div
          className="prose prose-neutral dark:prose-invert text-muted-foreground max-w-none text-base leading-relaxed"
          dangerouslySetInnerHTML={{ __html: blok.Introduction }}
        />
      );
    }

    const htmlContent = renderRichText(blok.Introduction);
    return (
      <div
        className="prose prose-neutral dark:prose-invert text-muted-foreground max-w-none text-base leading-relaxed"
        dangerouslySetInnerHTML={{ __html: htmlContent }}
      />
    );
  };

  return (
    <article
      {...storyblokEditable(blok)}
      data-testid="storyblok-event-directory-container"
      className="px-gutter mx-auto flex w-full max-w-7xl flex-col py-12 md:py-16"
    >
      {/* 1. Directory Header Landmark */}
      <section className="border-border/60 mb-10 flex flex-col items-start border-b pb-8 text-left md:mb-14">
        <span className="text-muted-foreground mb-3 inline-flex items-center gap-1.5 text-xs font-bold tracking-wider uppercase">
          <Calendar className="text-primary h-3.5 w-3.5" aria-hidden="true" />
          Hiring Opportunities &amp; Fair Directory
        </span>
        <h1 className="text-primary font-bold tracking-tight text-[var(--text-fluid-2xl)]">
          {pageTitle}
        </h1>
        {pageSubtitle && (
          <p className="text-muted-foreground mt-3 max-w-3xl text-balance text-[var(--text-fluid-lg)]">
            {pageSubtitle}
          </p>
        )}
        {blok.Introduction && <div className="mt-6 max-w-3xl">{renderIntro()}</div>}
      </section>

      {/* 2. Events Grid */}
      <section aria-label="Scheduled Hiring Events" className="w-full">
        {rawEvents.length > 0 ? (
          <div className="gap-gutter grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {rawEvents.map((event) => {
              const eventTitle = event.Title || event.title || 'Upcoming Career Fair';
              const eventDescription = event.Description || event.description || '';
              const eventDate = event.Date || event.date;
              const eventTime = event.Time || event.time;
              const eventLocation = event.Location || event.location || 'Virtual / Online';
              const eventCategory =
                event.Category || event.category || event.type || 'Hiring Event';
              const eventUrl = event.Link || event.link || event.url || '#';
              const isVirtual =
                event.isVirtual !== undefined
                  ? event.isVirtual
                  : event.IsVirtual !== undefined
                    ? event.IsVirtual
                    : eventLocation.toLowerCase().includes('virtual') ||
                      eventLocation.toLowerCase().includes('online');

              const isExternal = eventUrl.startsWith('http://') || eventUrl.startsWith('https://');

              return (
                <div
                  key={event._uid}
                  className="group bg-card border-border hover:border-primary/50 flex w-full flex-col justify-between rounded-xl border p-6 shadow-sm transition-all duration-200 hover:shadow-md"
                >
                  <div className="flex flex-col">
                    <div className="mb-3 flex items-center justify-between gap-2">
                      <span className="text-muted-foreground inline-flex items-center gap-1 text-xs font-bold tracking-wider uppercase">
                        <Tag className="text-primary h-3 w-3" aria-hidden="true" />
                        {eventCategory}
                      </span>
                      {isVirtual && (
                        <span className="bg-primary/10 text-primary rounded-full px-2.5 py-0.5 text-xs font-semibold">
                          Virtual
                        </span>
                      )}
                    </div>

                    <h2 className="text-foreground group-hover:text-primary mb-3 text-xl font-bold transition-colors">
                      {eventTitle}
                    </h2>

                    {/* Event Metadata: Date, Time, Location */}
                    <div className="text-muted-foreground mb-4 space-y-1.5 text-xs">
                      {eventDate && (
                        <div className="flex items-center gap-2">
                          <Calendar
                            className="text-primary/70 h-3.5 w-3.5 shrink-0"
                            aria-hidden="true"
                          />
                          <span>{eventDate}</span>
                        </div>
                      )}
                      {eventTime && (
                        <div className="flex items-center gap-2">
                          <Clock
                            className="text-primary/70 h-3.5 w-3.5 shrink-0"
                            aria-hidden="true"
                          />
                          <span>{eventTime}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <MapPin
                          className="text-primary/70 h-3.5 w-3.5 shrink-0"
                          aria-hidden="true"
                        />
                        <span>{eventLocation}</span>
                      </div>
                    </div>

                    {eventDescription && (
                      <p className="text-muted-foreground line-clamp-4 text-sm leading-relaxed">
                        {eventDescription}
                      </p>
                    )}
                  </div>

                  <div className="border-border/40 mt-6 border-t pt-4">
                    {isExternal ? (
                      <Link
                        href={eventUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary group/link focus-visible:ring-focus-ring inline-flex items-center gap-1.5 text-sm font-semibold hover:underline focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                      >
                        <span>Register / Details</span>
                        <ExternalLink
                          className="h-4 w-4 transition-transform group-hover/link:translate-x-0.5"
                          aria-hidden="true"
                        />
                        <span className="sr-only"> (opens in a new tab)</span>
                      </Link>
                    ) : (
                      <Link
                        href={eventUrl}
                        className="text-primary group/link focus-visible:ring-focus-ring inline-flex items-center gap-1.5 text-sm font-semibold hover:underline focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                      >
                        <span>View Event</span>
                        <ArrowRight
                          className="h-4 w-4 transition-transform group-hover/link:translate-x-0.5"
                          aria-hidden="true"
                        />
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="border-border bg-muted/30 p-gutter flex min-h-64 w-full flex-col items-center justify-center rounded-xl border text-center">
            <p className="text-muted-foreground text-[var(--text-fluid-base)]">
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
  );
};

export default EventDirectoryContent;
