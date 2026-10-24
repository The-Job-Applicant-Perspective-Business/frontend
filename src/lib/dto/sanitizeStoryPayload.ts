import { z } from 'zod';

/**
 * Zod Schema validating nested Storyblok Blok payloads.
 * Ensures each nested block conforms to standard Storyblok component shapes.
 */
export const BlokSchema = z
  .object({
    _uid: z.string().default(() => crypto.randomUUID()),
    component: z.string().min(1, 'Component blok identifier is required'),
    _editable: z.string().optional(),
  })
  .passthrough();

/**
 * Core Story Content schema.
 * Validates the primary story container and its child component tree.
 */
export const StoryContentSchema = z
  .object({
    _uid: z.string().optional(),
    component: z.string().optional(),
    body: z.array(BlokSchema).optional().default([]),
    meta_title: z.string().optional().default(''),
    meta_description: z.string().optional().default(''),
  })
  .passthrough();

/**
 * Invariant schema for sanitized Storyblok Story delivery.
 * Strips unvetted telemetry, database internals, and unparsed headers.
 */
export const SanitizedStorySchema = z.object({
  id: z.number().int().nonnegative().default(0),
  name: z.string().default('Untitled Page'),
  slug: z.string().default(''),
  full_slug: z.string().default(''),
  created_at: z.string().optional().default(''),
  published_at: z.string().nullable().optional().default(null),
  first_published_at: z.string().nullable().optional().default(null),
  content: StoryContentSchema.default({ body: [], meta_title: '', meta_description: '' }),
});

export type SanitizedStory = z.infer<typeof SanitizedStorySchema> & {
  // Enforces compatibility with Storyblok React RSC component expectations
  is_startpage?: boolean;
  tag_list?: string[];
};

/**
 * Sanitizes and validates raw Storyblok API payloads before client serialization.
 * Strips raw internal database UUIDs, administrative headers, and malformed blok trees.
 *
 * @param rawStory - The unknown raw payload returned from storyblokApi.get()
 * @returns SanitizedStory - A deterministic, schema-validated Story object
 */
export const sanitizeStoryPayload = (rawStory: unknown): SanitizedStory => {
  if (!rawStory || typeof rawStory !== 'object') {
    throw new Error('DTO_SANITIZATION_FAILED: Expected non-null object payload from CMS API.');
  }

  // Parse payload through Zod schema to enforce types and apply default fallbacks
  const validationResult = SanitizedStorySchema.safeParse(rawStory);

  if (!validationResult.success) {
    const errorDetails = validationResult.error.issues
      .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
      .join('; ');

    console.error(`Storyblok DTO Validation Error: ${errorDetails}`);
    throw new Error(`DTO_SANITIZATION_FAILED: Invalid story payload structure. [${errorDetails}]`);
  }

  const cleanData = validationResult.data;

  return cleanData;
};

export default sanitizeStoryPayload;
