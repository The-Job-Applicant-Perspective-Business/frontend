import React from 'react';
import { storyblokEditable, StoryblokComponent, renderRichText } from '@storyblok/react';
import type { SbBlokData, SbRichTextDoc } from '@storyblok/react';

export interface LegalDocumentContentProps {
  blok: {
    _uid: string;
    _editable?: string;
    Title?: string;
    Heading?: string;
    Subtitle?: string;
    Description?: string;
    LastUpdated?: string;
    EffectiveDate?: string;
    Content?: string | SbRichTextDoc;
    body?: SbBlokData[];
    [key: string]: unknown;
  };
}

export const LegalDocumentContent: React.FC<LegalDocumentContentProps> = ({ blok }) => {
  const documentTitle = blok.Heading || blok.Title || 'Privacy Policy';
  const documentSubtitle =
    blok.Subtitle ||
    blok.Description ||
    'Zero-knowledge applicant data custody, telemetry handling, and legal disclosures.';
  const effectiveDate = blok.EffectiveDate || blok.LastUpdated || 'October 2026';

  // Render Storyblok rich text object or treat as pre-rendered HTML/string
  const renderDocumentBody = () => {
    if (!blok.Content) return null;

    if (typeof blok.Content === 'string') {
      return (
        <div
          className="prose prose-neutral dark:prose-invert text-foreground max-w-none space-y-6 text-base leading-relaxed"
          dangerouslySetInnerHTML={{ __html: blok.Content }}
        />
      );
    }

    const htmlContent = renderRichText(blok.Content);
    return (
      <div
        className="prose prose-neutral dark:prose-invert text-foreground max-w-none space-y-6 text-base leading-relaxed"
        dangerouslySetInnerHTML={{ __html: htmlContent }}
      />
    );
  };

  return (
    <article
      {...storyblokEditable(blok)}
      data-testid="storyblok-legal-document-container"
      className="px-gutter mx-auto flex w-full max-w-4xl flex-col py-12 md:py-16"
    >
      {/* 1. Document Header & Effective Date Landmark */}
      <section className="border-border/60 mb-10 flex flex-col items-start border-b pb-8 text-left">
        <span className="text-muted-foreground mb-3 text-xs font-bold tracking-wider uppercase">
          Legal &amp; Compliance Disclosure
        </span>
        <h1 className="text-primary font-bold tracking-tight text-[var(--text-fluid-2xl)]">
          {documentTitle}
        </h1>
        {documentSubtitle && (
          <p className="text-muted-foreground mt-3 text-balance text-[var(--text-fluid-lg)]">
            {documentSubtitle}
          </p>
        )}
        <div className="text-muted-foreground mt-4 flex items-center gap-2 text-xs">
          <span>Effective Date:</span>
          <time dateTime={effectiveDate} className="text-foreground font-medium">
            {effectiveDate}
          </time>
        </div>
      </section>

      {/* 2. Structured Policy Body */}
      <section aria-label="Policy Provisions" className="w-full">
        {renderDocumentBody() || (
          <div className="border-border bg-card p-gutter rounded-xl border shadow-sm">
            <h2 className="text-foreground mb-4 text-xl font-bold">
              1. Zero-Knowledge Applicant Data Custody
            </h2>
            <p className="text-muted-foreground mb-6 text-base leading-relaxed">
              The Job Applicant Perspective (TJAP) operates on a local-first, zero-knowledge privacy
              architecture. We do not extract, monetize, or broker candidate demographic telemetry,
              search inquiries, or uncompensated labor data to third-party recruitment brokers or
              algorithmic scoring aggregators.
            </p>

            <h2 className="text-foreground mb-4 text-xl font-bold">
              2. Technical Telemetry &amp; Error Boundary Isolation
            </h2>
            <p className="text-muted-foreground mb-6 text-base leading-relaxed">
              Server-side error telemetry and diagnostic logging isolate application runtime
              exceptions without serializing identifiable candidate payloads. Network logs capture
              purely non-invertible diagnostic state transitions to maintain system uptime and
              accessibility standards under WCAG 2.2 AA.
            </p>

            <h2 className="text-foreground mb-4 text-xl font-bold">
              3. Data Retention and Deletion Rights
            </h2>
            <p className="text-muted-foreground text-base leading-relaxed">
              Inquiries, feedback entries, and community submissions remain subject to applicant
              revocation. Identifiers are cryptographically dissociated from public research
              archives to ensure that institutional employers cannot cross-reference candidate
              participation.
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

export default LegalDocumentContent;
