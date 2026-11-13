import React from 'react';
import { apiPlugin, storyblokInit, storyblokEditable } from '@storyblok/react/rsc';
import type { SbBlokData } from '@storyblok/react/rsc';
import { PageBlok } from '@/components/storyblok/PageBlok';
import { HomeContent } from '@/components/storyblok/HomeContent';
import { AboutUsContent } from '@/components/storyblok/AboutUsContent';
import { BlogListingContent } from '@/components/storyblok/BlogListingContent';
import { LegalDocumentContent } from '@/components/storyblok/LegalDocumentContent';
import { ResourceHubContent } from '@/components/storyblok/ResourceHubContent';
import { EventDirectoryContent } from '@/components/storyblok/EventDirectoryContent';
import { ToolingAuditContent } from '@/components/storyblok/ToolingAuditContent';
import { BlogArticleContent } from '@/components/storyblok/BlogArticleContent';
import { StandardPageContent } from '@/components/storyblok/StandardPageContent';
import {
  HeroSection,
  TabbedInterface,
  LocalJobsGrid,
  MissionBanner,
  BlogGrid,
  PromoBanner,
} from '@/components/blocks';
import cachedStoryFixture from '../tests/fixtures/storyblok-fixture.json';

interface FallbackBlokProps {
  blok: SbBlokData & {
    body?: SbBlokData[];
    [key: string]: unknown;
  };
}

/**
 * Zero-crash safety fallback for newly created or unmapped Storyblok Content Types.
 * Automatically renders nested `body` bloks if present so new CMS pages never fail silently.
 */
export const FallbackBlok: React.FC<FallbackBlokProps> = ({ blok }) => {
  const nestedBody = Array.isArray(blok?.body) ? blok.body : [];
  const content =
    nestedBody.length > 0
      ? React.createElement(
          'div',
          { className: 'mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-12 sm:px-6 lg:px-8' },
          nestedBody.map((nestedBlok) => {
            const Component =
              (nestedBlok.component
                ? (components as Record<string, React.ElementType>)[nestedBlok.component]
                : undefined) ?? FallbackBlok;
            return React.createElement(Component, {
              blok: nestedBlok,
              key: nestedBlok._uid,
            });
          }),
        )
      : process.env.NODE_ENV !== 'production'
        ? React.createElement(
            'div',
            {
              role: 'status',
              className:
                'mx-auto my-8 max-w-3xl rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900',
            },
            'Unmapped Storyblok component: ',
            React.createElement('code', null, blok?.component || 'unknown'),
          )
        : null;

  return React.createElement(
    'div',
    {
      ...storyblokEditable(blok),
      'data-testid': 'storyblok-fallback-blok',
      className: 'w-full bg-[#ffffff] text-[#434343]',
    },
    content,
  );
};

export const components = {
  page: PageBlok,

  // Universal zero-code page templates for dynamic slug creation
  'Standard Page': StandardPageContent,
  'standard-page': StandardPageContent,
  standard_page: StandardPageContent,
  'General Page': StandardPageContent,
  general_page: StandardPageContent,

  // Root page schemas
  'Home Content': HomeContent,
  home_content: HomeContent,

  'About us Content': AboutUsContent,
  about_us_content: AboutUsContent,

  'Blog List': BlogListingContent,
  blog_list: BlogListingContent,
  'Blog Content': BlogArticleContent,
  'blog-content': BlogArticleContent,
  blog_article: BlogArticleContent,

  'Privacy Policy Content': LegalDocumentContent,
  privacy_policy_content: LegalDocumentContent,

  'Self Care Content': ResourceHubContent,
  self_care_content: ResourceHubContent,

  'Financial Support Content': ResourceHubContent,
  financial_support_content: ResourceHubContent,

  'Career Fairs Content': EventDirectoryContent,
  career_fairs_content: EventDirectoryContent,

  // AI Tools - Mapping verified API slug + aliases
  'AI Tools Content': ToolingAuditContent,
  'A I Tools Content': ToolingAuditContent,
  ai_tools_content: ToolingAuditContent,
  'ai-tools': ToolingAuditContent,

  // Block-level schemas
  hero_section: HeroSection,
  tabbed_interface: TabbedInterface,
  promo_banner: PromoBanner,
  local_jobs_grid: LocalJobsGrid,
  mission_banner: MissionBanner,
  blog_grid: BlogGrid,
};

const getStoryblokToken = (): string => {
  return (
    process.env.STORYBLOK_DELIVERY_API_TOKEN ||
    process.env.STORYBLOK_ACCESS_TOKEN ||
    process.env.STORYBLOK_TOKEN ||
    ''
  );
};

const getStoryblokRegion = (): 'us' | 'eu' => {
  return (process.env.STORYBLOK_REGION as 'us' | 'eu') || 'eu';
};

export const isFixtureMode = (): boolean => {
  return process.env.USE_STORYBLOK_FIXTURES === 'true' || !getStoryblokToken();
};

export const getStoryblokConfigIssue = (): string | null => {
  if (isFixtureMode()) {
    return null;
  }

  const token = getStoryblokToken();
  if (!token) {
    return 'Missing Storyblok access token in environment variables.';
  }

  return null;
};

// Initialize the real Storyblok RSC SDK with fallback protection
const realStoryblokApi = storyblokInit({
  accessToken: getStoryblokToken() || 'dummy-init-token',
  use: [apiPlugin],
  apiOptions: {
    region: getStoryblokRegion(),
  },
  components,
  enableFallbackComponent: true,
  customFallbackComponent: FallbackBlok,
});

/**
 * Returns either the live Storyblok client or an offline mock client
 * that resolves directly from local fixtures.
 */
export const getStoryblokApi = () => {
  if (isFixtureMode()) {
    return {
      get: async (_slug: string, _params?: Record<string, unknown>) => {
        return {
          data: cachedStoryFixture,
          headers: {},
          status: 200,
          statusText: 'OK',
        };
      },
    } as unknown as ReturnType<typeof realStoryblokApi>;
  }

  return realStoryblokApi();
};

export const initStoryblok = (): void => {
  // Safe no-op when running dynamic route evaluation
};
