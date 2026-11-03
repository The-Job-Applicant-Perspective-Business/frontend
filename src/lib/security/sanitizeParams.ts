import { z } from 'zod';

/**
 * Strict slug segment regex: alphanumeric, underscores, and hyphens only.
 * Disallows dots, slashes, control characters, or script tags.
 */
const SAFE_SLUG_SEGMENT_REGEX = /^[a-zA-Z0-9_-]+$/;

/**
 * Sanitization regex to strip HTML/Script tags and dangerous attribute injectors.
 */
const DANGEROUS_INPUT_REGEX = new RegExp(
  `[<>'"\\\\&;${String.fromCharCode(0)}-${String.fromCharCode(31)}${String.fromCharCode(127)}]`,
  'g',
);

export const SlugSegmentSchema = z.string().trim().max(100).regex(SAFE_SLUG_SEGMENT_REGEX, {
  message: 'Slug segment contains invalid characters.',
});

export const SlugArraySchema = z.array(SlugSegmentSchema).max(10);

/**
 * Sanitizes and validates an array of route slug segments.
 * Returns null if traversal attempts or illegal characters are detected.
 */
export const sanitizeSlugSegments = (slug?: string[]): string[] | null => {
  if (!slug || slug.length === 0) {
    return [];
  }

  const parseResult = SlugArraySchema.safeParse(slug);
  if (!parseResult.success) {
    return null;
  }

  return parseResult.data;
};

/**
 * Strips script tags, HTML entities, and control characters from query parameter values.
 */
export const sanitizeQueryParamValue = (value: string): string => {
  return value.replace(DANGEROUS_INPUT_REGEX, '').trim().slice(0, 500);
};

/**
 * Normalizes and sanitizes searchParams into a hardened key-value record.
 */
export const sanitizeSearchParams = (rawParams?: {
  [key: string]: string | string[] | undefined;
}): Record<string, string | string[]> => {
  if (!rawParams) {
    return {};
  }

  const sanitized: Record<string, string | string[]> = {};

  for (const [key, val] of Object.entries(rawParams)) {
    const cleanKey = key.replace(DANGEROUS_INPUT_REGEX, '').trim().slice(0, 50);
    if (!cleanKey) continue;

    if (Array.isArray(val)) {
      sanitized[cleanKey] = val
        .map((item) => sanitizeQueryParamValue(item))
        .filter((item) => item.length > 0);
    } else if (typeof val === 'string') {
      sanitized[cleanKey] = sanitizeQueryParamValue(val);
    }
  }

  return sanitized;
};
