import React from 'react';
import Link from 'next/link';
import { storyblokEditable, StoryblokComponent, renderRichText } from '@storyblok/react';
import type { SbBlokData, SbRichTextDoc } from '@storyblok/react';
import {
  Cpu,
  ExternalLink,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Info,
} from 'lucide-react';

interface ToolItem {
  _uid: string;
  name?: string;
  Name?: string;
  title?: string;
  Title?: string;
  description?: string;
  Description?: string;
  category?: string;
  Category?: string;
  type?: string;
  verdict?: 'recommended' | 'caution' | 'critical' | string;
  Verdict?: string;
  surveillanceRisk?: 'low' | 'moderate' | 'high' | string;
  SurveillanceRisk?: string;
  link?: string;
  Link?: string;
  url?: string;
  tags?: string[];
  [key: string]: unknown;
}

export interface ToolingAuditContentProps {
  blok: {
    _uid: string;
    _editable?: string;
    Title?: string;
    Heading?: string;
    Subtitle?: string;
    Description?: string;
    Introduction?: string | SbRichTextDoc;
    Tools?: ToolItem[];
    Items?: ToolItem[];
    body?: SbBlokData[];
    [key: string]: unknown;
  };
}

export const ToolingAuditContent: React.FC<ToolingAuditContentProps> = ({ blok }) => {
  const pageTitle = blok.Heading || blok.Title || 'AI Tools & Algorithmic Audits';
  const pageSubtitle =
    blok.Subtitle ||
    blok.Description ||
    'Independent forensic evaluations of candidate-facing tools versus invasive hiring surveillance algorithms.';

  const rawTools = blok.Tools || blok.Items || [];

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

  const getVerdictBadge = (verdict?: string) => {
    const normalized = verdict?.toLowerCase() || '';
    if (
      normalized.includes('recommend') ||
      normalized.includes('pass') ||
      normalized.includes('low')
    ) {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
          Candidate Aligned
        </span>
      );
    }
    if (
      normalized.includes('caution') ||
      normalized.includes('moderate') ||
      normalized.includes('warn')
    ) {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-semibold text-amber-600 dark:text-amber-400">
          <Info className="h-3.5 w-3.5" aria-hidden="true" />
          Proceed with Caution
        </span>
      );
    }
    if (
      normalized.includes('critical') ||
      normalized.includes('high') ||
      normalized.includes('fail')
    ) {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/10 px-2.5 py-0.5 text-xs font-semibold text-rose-600 dark:text-rose-400">
          <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />
          Extraction Risk
        </span>
      );
    }
    return (
      <span className="bg-primary/10 text-primary inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold">
        <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
        Audited
      </span>
    );
  };

  return (
    <article
      {...storyblokEditable(blok)}
      data-testid="storyblok-tooling-audit-container"
      className="px-gutter mx-auto flex w-full max-w-7xl flex-col py-12 md:py-16"
    >
      {/* 1. Directory Header Landmark */}
      <header className="border-border/60 mb-10 flex flex-col items-start border-b pb-8 text-left md:mb-14">
        <span className="text-muted-foreground mb-3 inline-flex items-center gap-1.5 text-xs font-bold tracking-wider uppercase">
          <Cpu className="text-primary h-3.5 w-3.5" aria-hidden="true" />
          Technical Audits &amp; Algorithm Analysis
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
      </header>

      {/* 2. Tool Evaluation Grid */}
      <section aria-label="Audited Tools Directory" className="w-full">
        {rawTools.length > 0 ? (
          <div className="gap-gutter grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {rawTools.map((tool) => {
              const toolName =
                tool.Name || tool.name || tool.Title || tool.title || 'Untitled Tool';
              const toolDescription = tool.Description || tool.description || '';
              const toolCategory = tool.Category || tool.category || tool.type || 'Hiring Tool';
              const toolVerdict =
                tool.Verdict || tool.verdict || tool.SurveillanceRisk || tool.surveillanceRisk;
              const toolUrl = tool.Link || tool.link || tool.url || '#';
              const isExternal = toolUrl.startsWith('http://') || toolUrl.startsWith('https://');

              return (
                <div
                  key={tool._uid}
                  className="group bg-card border-border hover:border-primary/50 flex w-full flex-col justify-between rounded-xl border p-6 shadow-sm transition-all duration-200 hover:shadow-md"
                >
                  <div className="flex flex-col">
                    <div className="mb-3 flex items-center justify-between gap-2">
                      <span className="text-muted-foreground text-xs font-bold tracking-wider uppercase">
                        {toolCategory}
                      </span>
                      {getVerdictBadge(toolVerdict)}
                    </div>

                    <h2 className="text-foreground group-hover:text-primary mb-3 text-xl font-bold transition-colors">
                      {toolName}
                    </h2>

                    {toolDescription && (
                      <p className="text-muted-foreground line-clamp-4 text-sm leading-relaxed">
                        {toolDescription}
                      </p>
                    )}
                  </div>

                  <div className="border-border/40 mt-6 border-t pt-4">
                    {isExternal ? (
                      <Link
                        href={toolUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary group/link focus-visible:ring-focus-ring inline-flex items-center gap-1.5 text-sm font-semibold hover:underline focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                      >
                        <span>Audit Findings / Site</span>
                        <ExternalLink
                          className="h-4 w-4 transition-transform group-hover/link:translate-x-0.5"
                          aria-hidden="true"
                        />
                        <span className="sr-only"> (opens in a new tab)</span>
                      </Link>
                    ) : (
                      <Link
                        href={toolUrl}
                        className="text-primary group/link focus-visible:ring-focus-ring inline-flex items-center gap-1.5 text-sm font-semibold hover:underline focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                      >
                        <span>Read Full Audit</span>
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
              No software audits or surveillance evaluations published yet.
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

export default ToolingAuditContent;
