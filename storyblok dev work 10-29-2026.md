[storyblok.ts](http://storyblok.ts):

import { apiPlugin, storyblokInit } from '@storyblok/react/rsc';  
import { PageBlok } from '@/components/storyblok/PageBlok';  
import {  
HeroSection,  
TabbedInterface,  
LocalJobsGrid,  
MissionBanner,  
BlogGrid,  
PromoBanner,  
} from '@/components/blocks';

export const components \= {  
page: PageBlok,  
'Home Content': PageBlok,  
home\_content: PageBlok,  
hero\_section: HeroSection,  
tabbed\_interface: TabbedInterface,  
local\_jobs\_grid: LocalJobsGrid,  
mission\_banner: MissionBanner,  
blog\_grid: BlogGrid,  
promo\_banner: PromoBanner,  
};

const accessToken \=  
process.env.STORYBLOK\_DELIVERY\_API\_TOKEN \|\|  
process.env.NEXT\_PUBLIC\_STORYBLOK\_TOKEN \|\|  
process.env.NEXT\_PUBLIC\_STORYBLOK\_ACCESS\_TOKEN \|\|  
'';

const region \=  
(process.env.STORYBLOK\_REGION as 'us' \| 'eu') \|\|  
(process.env.NEXT\_PUBLIC\_STORYBLOK\_REGION as 'us' \| 'eu') \|\|  
'eu';

/\*\*  
\* Pure server-side configuration check. Returns a diagnostic string (never a  
\* token value) when configuration is unusable, or null when it looks present.  
\* Presence is not validity: a rejected token still surfaces as an API error.  
\* Reporting is left to the caller so this module stays free of handler coupling  
\* and the route remains the single logging boundary.  
\*/  
export const getStoryblokConfigIssue \= (): string \| null \=\> {  
if (\!accessToken) {  
return 'No Storyblok access token configured (checked STORYBLOK\_DELIVERY\_API\_TOKEN, NEXT\_PUBLIC\_STORYBLOK\_TOKEN, NEXT\_PUBLIC\_STORYBLOK\_ACCESS\_TOKEN).';  
}  
return null;  
};

export const getStoryblokApi \= storyblokInit({  
accessToken,  
use: \[apiPlugin\],  
apiOptions: {  
region,  
},  
components,  
});

export const initStoryblok \= () \=\> {  
return getStoryblokApi;  
};

Page.tsx:

import { cache } from 'react';  
import type { Metadata } from 'next';  
import { draftMode } from 'next/headers';  
import { notFound } from 'next/navigation';  
import { getStoryblokApi, StoryblokStory } from '@storyblok/react/rsc';  
import type { ISbStoryData } from '@storyblok/react';  
import { getStoryblokConfigIssue, initStoryblok } from '@/lib/storyblok';  
import { safeSanitizeStoryPayload } from '@/lib/dto/sanitizeStoryPayload';  
import {  
handleStoryblokError,  
type StoryblokErrorReport,  
} from '@/lib/dto/storyblok/storyblokErrorHandler';

export const dynamic \= 'force-dynamic';

type DynamicPageProps \= {  
params: Promise\<{ slug?: string\[\] }\>;  
searchParams?: Promise\<{ \[key: string\]: string \| string\[\] \| undefined }\>;  
};

/\*\*  
\* Discriminated result so the page can distinguish "no such page" from  
\* "the CMS pipeline failed". \`report: null\` means an expected, unlogged miss  
\* (system/browser paths).  
\*/  
type StoryFetchResult \=  
\| { ok: true; story: ISbStoryData }  
\| { ok: false; report: StoryblokErrorReport \| null };

const SYSTEM\_SLUG\_PREFIXES \= \['.well-known', 'favicon.ico', 'robots.txt', 'sitemap.xml'\];

const resolveSlugPath \= (slug?: string\[\]): string \=\> {  
return slug && slug.length \> 0 ? slug.join('/') : 'home';  
};

/\*\*  
\* Pulls an HTTP status off an unknown thrown value without trusting its shape.  
\* VERIFY against the installed Storyblok SDK's real rejection shape.  
\*/  
const extractStatus \= (error: unknown): number \| undefined \=\> {  
if (typeof error \=== 'object' && error \!== null && 'status' in error) {  
const { status } \= error as { status?: unknown };  
return typeof status \=== 'number' ? status : undefined;  
}  
return undefined;  
};

/\*\*  
\* Deduplicated dynamic story fetcher bounded by safe DTO sanitization.  
\* Wrapped in React.cache so metadata and page execution share one request.  
\* This is the single logging boundary: handleStoryblokError is called here and  
\* nowhere else in the route, so cached calls never log twice.  
\*/  
const fetchDynamicStory \= cache(  
async (slugPath: string, isDraft: boolean): Promise\<StoryFetchResult\> \=\> {  
if (SYSTEM\_SLUG\_PREFIXES.some((prefix) \=\> slugPath.startsWith(prefix))) {  
return { ok: false, report: null };  
}

    const context \= { operation: 'fetchDynamicStory', slug: slugPath };

    const configIssue \= getStoryblokConfigIssue();
    if (configIssue) {
      const report \= handleStoryblokError(new Error(configIssue), context, {
        category: 'CONFIG',
      });
      return { ok: false, report };
    }

    try {
      initStoryblok();
      const storyblokApi \= getStoryblokApi();
      const response \= await storyblokApi.get(\`cdn/stories/\${slugPath}\`, {
        version: isDraft ? 'draft' : 'published',
        cv: isDraft ? Date.now() : undefined,
        resolve\_relations: '',
      });

      // Pass raw CMS payload to the deterministic unwrapper and Zod validator
      const result \= safeSanitizeStoryPayload(response);

      if (\!result.success) {
        const report \= handleStoryblokError(
          new Error(\`DTO validation rejected: \${String(result.error)}\`),
          context,
          { category: 'VALIDATION' },
        );
        return { ok: false, report };
      }

      return { ok: true, story: result.data as unknown as ISbStoryData };
    } catch (error) {
      const status \= extractStatus(error);
      const report \= handleStoryblokError(
        error,
        { ...context, status },
        // Explicit category for the one case we can name with certainty;
        // everything else falls through to the handler's inference.
        status \=== 404 ? { category: 'NOT\_FOUND' } : undefined,
      );
      return { ok: false, report };
    }

},  
);

export const generateMetadata \= async ({ params }: DynamicPageProps): Promise\<Metadata\> \=\> {  
const { slug } \= await params;  
const slugPath \= resolveSlugPath(slug);  
const { isEnabled: isDraft } \= await draftMode();

const result \= await fetchDynamicStory(slugPath, isDraft);

// Metadata never throws: any failure degrades to site defaults and the page  
// body decides the user-facing outcome.  
if (\!result.ok \|\| \!result.story.content) {  
return {  
title: 'The Job Applicant Perspective',  
description: 'Documenting the applicant timeline and market dynamics.',  
};  
}

const { story } \= result;  
const metaTitle \=  
(story.content.meta\_title as string) \|\| story.name \|\| 'The Job Applicant Perspective';  
const metaDescription \=  
(story.content.meta\_description as string) \|\|  
'Documenting the applicant timeline and market dynamics.';

return {  
title: metaTitle,  
description: metaDescription,  
openGraph: {  
title: metaTitle,  
description: metaDescription,  
},  
twitter: {  
card: 'summary\_large\_image',  
title: metaTitle,  
description: metaDescription,  
},  
};  
};

const DynamicPage \= async ({ params }: DynamicPageProps) \=\> {  
const { slug } \= await params;  
const slugPath \= resolveSlugPath(slug);  
const { isEnabled: isDraft } \= await draftMode();

const result \= await fetchDynamicStory(slugPath, isDraft);

if (\!result.ok) {  
const { report } \= result;

    // Expected misses and corrupt payloads keep the existing clean-404 behavior.
    if (\!report \|\| report.category \=== 'NOT\_FOUND' \|\| report.category \=== 'VALIDATION') {
      notFound();
    }

    // CONFIG / API / INITIALIZATION / UNKNOWN are not "missing pages".
    // Hand off to the nearest error boundary with only the visitor-safe message.
    throw new Error(report.safeMessage);

}

return (  
\<div className\="relative flex w-full flex-grow flex-col"\>  
\<StoryblokStory story\={result.story} /\>  
\</div\>  
);  
};

export default DynamicPage;

Storyblok error handling:

/\*\*  
\* Centralized Storyblok error classification and diagnostics.  
\*  
\* Location: lib/dto/storyblok/storyblokErrorHandler.ts  
\*  
\* This module is intentionally framework-agnostic: it does not import React,  
\* Next.js, or the Storyblok SDK. Call it from API, route, validation, and  
\* component-resolution boundaries.  
\*/

export type StoryblokErrorCategory \=  
\| 'CONFIG'  
\| 'API'  
\| 'NOT\_FOUND'  
\| 'VALIDATION'  
\| 'COMPONENT'  
\| 'INITIALIZATION'  
\| 'RENDER'  
\| 'UNKNOWN';

export type StoryblokErrorSeverity \= 'debug' \| 'info' \| 'warn' \| 'error';

export interface StoryblokErrorContext {  
/\*\* Optional operation name, e.g. "fetchDynamicStory". \*/  
operation?: string;  
/\*\* Story slug/path, when known. \*/  
slug?: string;  
/\*\* Storyblok component technical name, when known. \*/  
component?: string;  
/\*\* Path to a nested block, e.g. "home.body\[0\]". \*/  
blockPath?: string;  
/\*\* HTTP status from an API response, if available. \*/  
status?: number;  
/\*\* Additional safe diagnostic fields. Do not include tokens or secrets. \*/  
details?: Record\<string, unknown\>;  
}

export interface StoryblokErrorReport {  
ok: false;  
category: StoryblokErrorCategory;  
message: string;  
safeMessage: string;  
severity: StoryblokErrorSeverity;  
retryable: boolean;  
context: StoryblokErrorContext;  
cause?: unknown;  
}

export interface StoryblokSuccess\<T\> {  
ok: true;  
value: T;  
}

export type StoryblokResult\<T\> \= StoryblokSuccess\<T\> \| StoryblokErrorReport;

export interface HandleStoryblokErrorOptions {  
category?: StoryblokErrorCategory;  
context?: StoryblokErrorContext;  
severity?: StoryblokErrorSeverity;  
/\*\* Override the visitor-safe message. Never include credentials or internals. \*/  
safeMessage?: string;  
/\*\* Override retryability when the caller has more specific knowledge. \*/  
retryable?: boolean;  
/\*\* Override the development/production mode. Defaults to NODE\_ENV. \*/  
isProduction?: boolean;  
/\*\* Disable console output when the caller will log the report elsewhere. \*/  
log?: boolean;  
}

const DEFAULT\_SAFE\_MESSAGES: Record\<StoryblokErrorCategory, string\> \= {  
CONFIG: 'The page content is temporarily unavailable.',  
API: 'The page content is temporarily unavailable.',  
NOT\_FOUND: 'This page could not be found.',  
VALIDATION: 'The page content is temporarily unavailable.',  
COMPONENT: 'Part of this page is currently unavailable.',  
INITIALIZATION: 'The page content is temporarily unavailable.',  
RENDER: 'Part of this page could not be displayed.',  
UNKNOWN: 'The page content is temporarily unavailable.',  
};

const getEnvironmentIsProduction \= (): boolean \=\>  
typeof process \!== 'undefined' && process.env?.NODE\_ENV \=== 'production';

const toErrorMessage \= (cause: unknown): string \=\> {  
if (cause instanceof Error) return cause.message;  
if (typeof cause \=== 'string') return cause;  
if (cause && typeof cause \=== 'object') {  
const candidate \= cause as { message?: unknown; statusText?: unknown };  
if (typeof candidate.message \=== 'string') return candidate.message;  
if (typeof candidate.statusText \=== 'string') return candidate.statusText;  
}  
return 'An unknown error occurred.';  
};

const getHttpStatus \= (cause: unknown): number \| undefined \=\> {  
if (\!cause \|\| typeof cause \!== 'object') return undefined;

const value \= cause as {  
status?: unknown;  
statusCode?: unknown;  
response?: { status?: unknown };  
};

const status \= value.status ?? value.statusCode ?? value.response?.status;  
return typeof status \=== 'number' ? status : undefined;  
};

const inferCategory \= (  
cause: unknown,  
context: StoryblokErrorContext,  
): StoryblokErrorCategory \=\> {  
const status \= context.status ?? getHttpStatus(cause);  
const message \= toErrorMessage(cause).toLowerCase();

if (context.component) return 'COMPONENT';  
if (  
status \=== 404 \|\|  
message.includes('not found') \|\|  
message.includes('does not exist')  
) {  
return 'NOT\_FOUND';  
}  
if (  
status \=== 401 \|\|  
status \=== 403 \|\|  
message.includes('access token') \|\|  
message.includes('unauthorized') \|\|  
message.includes('forbidden') \|\|  
message.includes('missing token')  
) {  
return 'CONFIG';  
}  
if (  
message.includes('validation') \|\|  
message.includes('invalid payload') \|\|  
message.includes('schema')  
) {  
return 'VALIDATION';  
}  
if (  
message.includes('network') \|\|  
message.includes('fetch failed') \|\|  
message.includes('timeout') \|\|  
message.includes('econn')  
) {  
return 'API';  
}  
return 'UNKNOWN';  
};

const inferRetryable \= (  
category: StoryblokErrorCategory,  
status?: number,  
): boolean \=\> {  
if (category \=== 'API') return true;  
if (typeof status \=== 'number') return status \=== 408 \|\| status \=== 429 \|\| status \>= 500;  
return false;  
};

/\*\*  
\* Classify, normalize, and log a Storyblok-related failure.  
\*  
\* The returned \`message\` is for diagnostics; \`safeMessage\` is suitable for  
\* user-facing fallback UI. Avoid sending \`cause\` or \`message\` to the browser.  
\*/  
export function handleStoryblokError(  
cause: unknown,  
options: HandleStoryblokErrorOptions \= {},  
): StoryblokErrorReport {  
const context \= { ...(options.context ?? {}) };  
const status \= context.status ?? getHttpStatus(cause);  
if (status \!== undefined) context.status \= status;

const category \= options.category ?? inferCategory(cause, context);  
const message \= toErrorMessage(cause);  
const severity \=  
options.severity ??  
(category \=== 'NOT\_FOUND' ? 'info' : category \=== 'UNKNOWN' ? 'error' : 'warn');

const report: StoryblokErrorReport \= {  
ok: false,  
category,  
message,  
safeMessage: options.safeMessage ?? DEFAULT\_SAFE\_MESSAGES\[category\],  
severity,  
retryable: options.retryable ?? inferRetryable(category, status),  
context,  
cause,  
};

if (options.log \!== false) {  
const isProduction \= options.isProduction ?? getEnvironmentIsProduction();  
const diagnostic \= {  
category: report.category,  
operation: context.operation,  
slug: context.slug,  
component: context.component,  
blockPath: context.blockPath,  
status: context.status,  
retryable: report.retryable,  
message: isProduction ? report.safeMessage : report.message,  
...(isProduction ? {} : { details: context.details }),  
};

    const prefix \= \`\[Storyblok:\${report.category}\]\`;
    if (report.severity \=== 'error') console.error(prefix, diagnostic);
    else if (report.severity \=== 'warn') console.warn(prefix, diagnostic);
    else if (report.severity \=== 'info') console.info(prefix, diagnostic);
    else console.debug(prefix, diagnostic);

}

return report;  
}

/\*\* Convenience helper for expected missing-story cases. \*/  
export function storyblokNotFound(  
slug: string,  
options: Omit\<HandleStoryblokErrorOptions, 'category' \| 'context'\> & {  
context?: Omit\<StoryblokErrorContext, 'slug'\>;  
} \= {},  
): StoryblokErrorReport {  
return handleStoryblokError(new Error(\`Story not found: \${slug}\`), {  
...options,  
category: 'NOT\_FOUND',  
severity: options.severity ?? 'info',  
context: { ...options.context, slug },  
safeMessage: options.safeMessage ?? DEFAULT\_SAFE\_MESSAGES.NOT\_FOUND,  
retryable: false,  
});  
}

/\*\* Convenience helper for missing or invalid environment configuration. \*/  
export function storyblokConfigError(  
message: string,  
context: StoryblokErrorContext \= {},  
): StoryblokErrorReport {  
return handleStoryblokError(new Error(message), {  
category: 'CONFIG',  
context,  
severity: 'error',  
retryable: false,  
});  
}

/\*\* Convenience helper for unregistered Storyblok component names. \*/  
export function storyblokComponentError(  
component: string,  
blockPath?: string,  
): StoryblokErrorReport {  
return handleStoryblokError(  
new Error(\`Unregistered Storyblok component: "\${component \|\| 'unknown'}"\`),  
{  
category: 'COMPONENT',  
context: { component: component \|\| 'unknown', blockPath },  
severity: 'warn',  
retryable: false,  
},  
);  
}

/\*\* Convert a try/catch outcome to a consistent discriminated result. \*/  
export function storyblokFailure\<T \= never\>(  
cause: unknown,  
options: HandleStoryblokErrorOptions \= {},  
): StoryblokResult\<T\> {  
return handleStoryblokError(cause, options);  
}

/\*\* Safe default message for a category, useful in fallback UI. \*/  
export function getStoryblokSafeMessage(  
category: StoryblokErrorCategory,  
): string {  
return DEFAULT\_SAFE\_MESSAGES\[category\];  
}
