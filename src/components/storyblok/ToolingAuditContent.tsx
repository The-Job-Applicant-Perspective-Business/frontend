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
  DollarSign,
} from 'lucide-react';

interface ToolItem {
  _uid: string;
  Heading?: string;
  heading?: string;
  name?: string;
  Name?: string;
  title?: string;
  Title?: string;
  description?: string;
  Description?: string;
  Cost?: string;
  cost?: string;
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

interface SectionItem {
  _uid: string;
  Heading?: string;
  heading?: string;
  component?: string;
  Tools?: ToolItem[];
  tools?: ToolItem[];
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
    Sections?: SectionItem[];
    sections?: SectionItem[];
    Tools?: ToolItem[];
    Items?: ToolItem[];
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

export const ToolingAuditContent: React.FC<ToolingAuditContentProps> = ({ blok }) => {
  const pageTitle = blok.Heading || blok.Title || 'AI Tools & Algorithmic Audits';
  const pageSubtitle =
    blok.Subtitle ||
    blok.Description ||
    'Independent forensic evaluations of candidate-facing tools versus invasive hiring surveillance algorithms.';

  const sections: SectionItem[] = blok.Sections || blok.sections || [];
  const flatTools: ToolItem[] = blok.Tools || blok.Items || [];

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

  const getVerdictBadge = (verdict?: string): React.ReactNode => {
    const normalized = verdict?.toLowerCase() || '';
    if (
      normalized.includes('recommend') ||
      normalized.includes('pass') ||
      normalized.includes('low')
    ) {
      return (
        <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
          <CheckCircle2 className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
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
        <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-900">
          <Info className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
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
        <span className="inline-flex items-center gap-1 rounded-full border border-rose-200 bg-rose-50 px-2.5 py-0.5 text-xs font-semibold text-rose-800">
          <AlertTriangle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          Extraction Risk
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-[#0d3276]/20 bg-[#0d3276]/10 px-2.5 py-0.5 text-xs font-semibold text-[#0d3276]">
        <ShieldCheck className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        Audited
      </span>
    );
  };

  const renderToolCard = (tool: ToolItem, fallbackCategory?: string): React.ReactNode => {
    const toolName =
      tool.Heading ||
      tool.heading ||
      tool.Name ||
      tool.name ||
      tool.Title ||
      tool.title ||
      'Untitled Tool';
    const toolDescription = tool.Description || tool.description || '';
    const toolCategory =
      tool.Category || tool.category || tool.type || fallbackCategory || 'Hiring Tool';
    const toolCost = tool.Cost || tool.cost;
    const toolVerdict =
      tool.Verdict || tool.verdict || tool.SurveillanceRisk || tool.surveillanceRisk;
    const safeHref = sanitizeHref(tool.Link || tool.link || tool.url);
    const isExternal =
      safeHref !== null && (safeHref.startsWith('http://') || safeHref.startsWith('https://'));

    return (
      <div
        key={tool._uid}
        className="group flex w-full flex-col justify-between rounded-xl border border-slate-200 bg-[#ffffff] p-6 shadow-sm transition-all duration-200 hover:border-[#0d3276]/50 hover:shadow-md"
      >
        <div className="flex flex-col">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-bold tracking-wider text-[#434343] uppercase">
              {toolCategory}
            </span>
            {getVerdictBadge(toolVerdict)}
          </div>

          <h3 className="mb-2 text-xl font-bold text-[#0d3276] transition-colors group-hover:text-[#081F48]">
            {toolName}
          </h3>

          {toolDescription && (
            <p className="line-clamp-4 text-sm leading-relaxed text-[#434343]">{toolDescription}</p>
          )}

          {toolCost && (
            <div className="mt-4 flex items-start gap-1.5 rounded-lg border border-slate-200 bg-slate-50 p-2.5 text-xs text-[#434343]">
              <DollarSign className="h-4 w-4 shrink-0 text-emerald-700" aria-hidden="true" />
              <span className="font-medium">
                <span className="sr-only">Pricing: </span>
                {toolCost}
              </span>
            </div>
          )}
        </div>

        <div className="mt-6 border-t border-slate-200 pt-4">
          {safeHref ? (
            isExternal ? (
              <Link
                href={safeHref}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Visit ${toolName} (opens in a new tab)`}
                className="group/link inline-flex items-center gap-1.5 rounded-sm text-sm font-semibold text-[#0d3276] underline-offset-4 hover:text-[#081F48] hover:underline focus-visible:ring-2 focus-visible:ring-[#0d3276] focus-visible:ring-offset-2 focus-visible:outline-none"
              >
                <span>Visit Tool</span>
                <ExternalLink
                  className="h-4 w-4 transition-transform group-hover/link:translate-x-0.5"
                  aria-hidden="true"
                />
              </Link>
            ) : (
              <Link
                href={safeHref}
                aria-label={`Read full audit for ${toolName}`}
                className="group/link inline-flex items-center gap-1.5 rounded-sm text-sm font-semibold text-[#0d3276] underline-offset-4 hover:text-[#081F48] hover:underline focus-visible:ring-2 focus-visible:ring-[#0d3276] focus-visible:ring-offset-2 focus-visible:outline-none"
              >
                <span>Read Full Audit</span>
                <ArrowRight
                  className="h-4 w-4 transition-transform group-hover/link:translate-x-0.5"
                  aria-hidden="true"
                />
              </Link>
            )
          ) : (
            <span className="text-xs font-medium text-slate-600">Audit reference link pending</span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div
      {...storyblokEditable(blok)}
      data-testid="storyblok-tooling-audit-container"
      className="min-h-screen w-full bg-[#ffffff] text-[#434343]"
    >
      {/* Top Header Clearance Bar matching BlogArticleContent & EventDirectoryContent */}
      <div
        className="h-[70px] w-full border-b border-[#9CABC7] bg-[#ffffff] lg:h-[124px]"
        aria-hidden="true"
      />

      <article className="mx-auto flex w-full max-w-7xl flex-col px-4 py-12 sm:px-6 md:py-16 lg:px-8">
        {/* 1. Directory Header Landmark */}
        <section
          aria-labelledby="tooling-audit-heading"
          className="mb-10 flex flex-col items-start border-b border-slate-200 pb-8 text-left md:mb-14"
        >
          <span className="mb-3 inline-flex items-center gap-1.5 text-xs font-bold tracking-wider text-[#0d3276] uppercase">
            <Cpu className="h-3.5 w-3.5 text-[#0d3276]" aria-hidden="true" />
            Technical Audits &amp; Algorithm Analysis
          </span>
          <h1
            id="tooling-audit-heading"
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

        {/* 2. Tool Evaluation Directory */}
        <section aria-label="Audited Tools Directory" className="flex w-full flex-col gap-12">
          {sections.length > 0 ? (
            sections.map((section) => {
              const sectionTitle = section.Heading || section.heading || 'Categorized Tools';
              const sectionTools = section.Tools || section.tools || [];

              return (
                <div key={section._uid} className="flex w-full flex-col">
                  <h2 className="mb-6 border-b border-slate-200 pb-2 text-2xl font-bold tracking-tight text-[#0d3276]">
                    {sectionTitle}
                  </h2>
                  {sectionTools.length > 0 ? (
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
                      {sectionTools.map((tool) => renderToolCard(tool, sectionTitle))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-600 italic">
                      No tools currently cataloged under this section.
                    </p>
                  )}
                </div>
              );
            })
          ) : flatTools.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
              {flatTools.map((tool) => renderToolCard(tool))}
            </div>
          ) : (
            <div
              role="status"
              className="flex min-h-64 w-full flex-col items-center justify-center rounded-xl border border-slate-200 bg-slate-50 p-8 text-center"
            >
              <p className="text-base font-medium text-[#434343]">
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
    </div>
  );
};

export default ToolingAuditContent;
