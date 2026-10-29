/**
 * Centralized Storyblok error classification and diagnostics.
 *
 * Location: lib/dto/storyblok/storyblokErrorHandler.ts
 *
 * This module is intentionally framework-agnostic: it does not import React,
 * Next.js, or the Storyblok SDK. Call it from API, route, validation, and
 * component-resolution boundaries.
 */

export type StoryblokErrorCategory =
  | 'CONFIG'
  | 'API'
  | 'NOT_FOUND'
  | 'VALIDATION'
  | 'COMPONENT'
  | 'INITIALIZATION'
  | 'RENDER'
  | 'UNKNOWN';

export type StoryblokErrorSeverity = 'debug' | 'info' | 'warn' | 'error';

export interface StoryblokErrorContext {
  /** Optional operation name, e.g. "fetchDynamicStory". */
  operation?: string;
  /** Story slug/path, when known. */
  slug?: string;
  /** Storyblok component technical name, when known. */
  component?: string;
  /** Path to a nested block, e.g. "home.body[0]". */
  blockPath?: string;
  /** HTTP status from an API response, if available. */
  status?: number;
  /** Additional safe diagnostic fields. Do not include tokens or secrets. */
  details?: Record<string, unknown>;
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

export interface StoryblokSuccess<T> {
  ok: true;
  value: T;
}

export type StoryblokResult<T> = StoryblokSuccess<T> | StoryblokErrorReport;

export interface HandleStoryblokErrorOptions {
  category?: StoryblokErrorCategory;
  context?: StoryblokErrorContext;
  severity?: StoryblokErrorSeverity;
  /** Override the visitor-safe message. Never include credentials or internals. */
  safeMessage?: string;
  /** Override retryability when the caller has more specific knowledge. */
  retryable?: boolean;
  /** Override the development/production mode. Defaults to NODE_ENV. */
  isProduction?: boolean;
  /** Disable console output when the caller will log the report elsewhere. */
  log?: boolean;
}

const DEFAULT_SAFE_MESSAGES: Record<StoryblokErrorCategory, string> = {
  CONFIG: 'The page content is temporarily unavailable.',
  API: 'The page content is temporarily unavailable.',
  NOT_FOUND: 'This page could not be found.',
  VALIDATION: 'The page content is temporarily unavailable.',
  COMPONENT: 'Part of this page is currently unavailable.',
  INITIALIZATION: 'The page content is temporarily unavailable.',
  RENDER: 'Part of this page could not be displayed.',
  UNKNOWN: 'The page content is temporarily unavailable.',
};

const getEnvironmentIsProduction = (): boolean =>
  typeof process !== 'undefined' && process.env?.NODE_ENV === 'production';

const toErrorMessage = (cause: unknown): string => {
  if (cause instanceof Error) return cause.message;
  if (typeof cause === 'string') return cause;
  if (cause && typeof cause === 'object') {
    const candidate = cause as { message?: unknown; statusText?: unknown };
    if (typeof candidate.message === 'string') return candidate.message;
    if (typeof candidate.statusText === 'string') return candidate.statusText;
  }
  return 'An unknown error occurred.';
};

const getHttpStatus = (cause: unknown): number | undefined => {
  if (!cause || typeof cause !== 'object') return undefined;

  const value = cause as {
    status?: unknown;
    statusCode?: unknown;
    response?: { status?: unknown };
  };

  const status = value.status ?? value.statusCode ?? value.response?.status;
  return typeof status === 'number' ? status : undefined;
};

const inferCategory = (cause: unknown, context: StoryblokErrorContext): StoryblokErrorCategory => {
  const status = context.status ?? getHttpStatus(cause);
  const message = toErrorMessage(cause).toLowerCase();

  if (context.component) return 'COMPONENT';
  if (status === 404 || message.includes('not found') || message.includes('does not exist')) {
    return 'NOT_FOUND';
  }
  if (
    status === 401 ||
    status === 403 ||
    message.includes('access token') ||
    message.includes('unauthorized') ||
    message.includes('forbidden') ||
    message.includes('missing token')
  ) {
    return 'CONFIG';
  }
  if (
    message.includes('validation') ||
    message.includes('invalid payload') ||
    message.includes('schema')
  ) {
    return 'VALIDATION';
  }
  if (
    message.includes('network') ||
    message.includes('fetch failed') ||
    message.includes('timeout') ||
    message.includes('econn')
  ) {
    return 'API';
  }
  return 'UNKNOWN';
};

const inferRetryable = (category: StoryblokErrorCategory, status?: number): boolean => {
  if (category === 'API') return true;
  if (typeof status === 'number') return status === 408 || status === 429 || status >= 500;
  return false;
};

/**
 * Classify, normalize, and log a Storyblok-related failure.
 *
 * The returned `message` is for diagnostics; `safeMessage` is suitable for
 * user-facing fallback UI. Avoid sending `cause` or `message` to the browser.
 */
export function handleStoryblokError(
  cause: unknown,
  options: HandleStoryblokErrorOptions = {},
): StoryblokErrorReport {
  const context = { ...(options.context ?? {}) };
  const status = context.status ?? getHttpStatus(cause);
  if (status !== undefined) context.status = status;

  const category = options.category ?? inferCategory(cause, context);
  const message = toErrorMessage(cause);
  const severity =
    options.severity ??
    (category === 'NOT_FOUND' ? 'info' : category === 'UNKNOWN' ? 'error' : 'warn');

  const report: StoryblokErrorReport = {
    ok: false,
    category,
    message,
    safeMessage: options.safeMessage ?? DEFAULT_SAFE_MESSAGES[category],
    severity,
    retryable: options.retryable ?? inferRetryable(category, status),
    context,
    cause,
  };

  if (options.log !== false) {
    const isProduction = options.isProduction ?? getEnvironmentIsProduction();
    const diagnostic = {
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

    const prefix = `[Storyblok:${report.category}]`;
    if (report.severity === 'error') console.error(prefix, diagnostic);
    else if (report.severity === 'warn') console.warn(prefix, diagnostic);
    else if (report.severity === 'info') console.info(prefix, diagnostic);
    else console.debug(prefix, diagnostic);
  }

  return report;
}

/** Convenience helper for expected missing-story cases. */
export function storyblokNotFound(
  slug: string,
  options: Omit<HandleStoryblokErrorOptions, 'category' | 'context'> & {
    context?: Omit<StoryblokErrorContext, 'slug'>;
  } = {},
): StoryblokErrorReport {
  return handleStoryblokError(new Error(`Story not found: ${slug}`), {
    ...options,
    category: 'NOT_FOUND',
    severity: options.severity ?? 'info',
    context: { ...options.context, slug },
    safeMessage: options.safeMessage ?? DEFAULT_SAFE_MESSAGES.NOT_FOUND,
    retryable: false,
  });
}

/** Convenience helper for missing or invalid environment configuration. */
export function storyblokConfigError(
  message: string,
  context: StoryblokErrorContext = {},
): StoryblokErrorReport {
  return handleStoryblokError(new Error(message), {
    category: 'CONFIG',
    context,
    severity: 'error',
    retryable: false,
  });
}

/** Convenience helper for unregistered Storyblok component names. */
export function storyblokComponentError(
  component: string,
  blockPath?: string,
): StoryblokErrorReport {
  return handleStoryblokError(
    new Error(`Unregistered Storyblok component: "${component || 'unknown'}"`),
    {
      category: 'COMPONENT',
      context: { component: component || 'unknown', blockPath },
      severity: 'warn',
      retryable: false,
    },
  );
}

/** Convert a try/catch outcome to a consistent discriminated result. */
export function storyblokFailure<T = never>(
  cause: unknown,
  options: HandleStoryblokErrorOptions = {},
): StoryblokResult<T> {
  return handleStoryblokError(cause, options);
}

/** Safe default message for a category, useful in fallback UI. */
export function getStoryblokSafeMessage(category: StoryblokErrorCategory): string {
  return DEFAULT_SAFE_MESSAGES[category];
}
