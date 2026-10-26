import { z } from 'zod';

/**
 * Validates individual Storyblok nested component blocks.
 * Enforces required identifiers while sanitizing block-level parameters.
 */
export const BlokSchema = z
  .object({
    _uid: z.string().default(() => crypto.randomUUID()),
    component: z.string().min(1, 'Component blok identifier is required'),
    _editable: z.string().optional(),
  })
  .passthrough();

export type Blok = z.infer<typeof BlokSchema>;

/**
 * Validates Storyblok content containers and child component arrays.
 */
export const StoryContentSchema = z
  .object({
    _uid: z.string().optional(),
    component: z.string().optional(),
    body: z.array(BlokSchema).default([]),
    meta_title: z.string().default(''),
    meta_description: z.string().default(''),
  })
  .passthrough();

export type StoryContent = z.infer<typeof StoryContentSchema>;

/**
 * Invariant schema for sanitized Storyblok story delivery.
 * Enforces runtime schema parity with Storyblok React component expectations.
 */
export const SanitizedStorySchema = z.object({
  id: z.number().int().nonnegative().default(0),
  name: z.string().default('Untitled Page'),
  slug: z.string().default(''),
  full_slug: z.string().default(''),
  created_at: z.string().default(''),
  published_at: z.string().nullable().default(null),
  first_published_at: z.string().nullable().default(null),
  is_startpage: z.boolean().default(false),
  tag_list: z.array(z.string()).default([]),
  content: StoryContentSchema.default({
    body: [],
    meta_title: '',
    meta_description: '',
  }),
});

export type SanitizedStory = z.infer<typeof SanitizedStorySchema>;

export type SanitizationResult =
  { success: true; data: SanitizedStory } | { success: false; error: string };

/**
 * Normalizes input by unwrapping Storyblok API client responses.
 */
const unwrapStoryPayload = (raw: unknown): unknown => {
  if (!raw || typeof raw !== 'object') return raw;

  const candidate = raw as Record<string, unknown>;

  // Handles storyblokApi.get() full response: { data: { story: { ... } } }
  if (candidate.data && typeof candidate.data === 'object') {
    const dataObj = candidate.data as Record<string, unknown>;
    if (dataObj.story) return dataObj.story;
  }

  // Handles { story: { ... } }
  if (candidate.story) {
    return candidate.story;
  }

  return raw;
};

/**
 * Safe parser returning a discriminated union.
 * Prevents Next.js Server Component 500 error crashes on malformed data.
 */
export const safeSanitizeStoryPayload = (rawPayload: unknown): SanitizationResult => {
  if (!rawPayload || typeof rawPayload !== 'object') {
    return {
      success: false,
      error: 'DTO_SANITIZATION_FAILED: Expected non-null object payload from CMS API.',
    };
  }

  const unwrapped = unwrapStoryPayload(rawPayload);
  const result = SanitizedStorySchema.safeParse(unwrapped);

  if (!result.success) {
    const errorDetails = result.error.issues
      .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
      .join('; ');

    return {
      success: false,
      error: `DTO_SANITIZATION_FAILED: Invalid story payload structure. [${errorDetails}]`,
    };
  }

  return {
    success: true,
    data: result.data,
  };
};

/**
 * Strict parser for operations where an invalid payload must abort execution.
 */
export const sanitizeStoryPayload = (rawPayload: unknown): SanitizedStory => {
  const result = safeSanitizeStoryPayload(rawPayload);

  if (!result.success) {
    console.error(`Storyblok DTO Validation Error: ${result.error}`);
    throw new Error(result.error);
  }

  return result.data;
};

export default sanitizeStoryPayload;
