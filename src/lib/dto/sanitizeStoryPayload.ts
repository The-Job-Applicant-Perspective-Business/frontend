import { ISbStory } from '@storyblok/react';

export interface SanitizedStory extends ISbStory {
  id: number;
  uuid: string;
  name: string;
  slug: string;
  full_slug: string;
  content: Record<string, unknown>;
}

export const sanitizeStoryPayload = (rawStory: unknown): SanitizedStory => {
  if (!rawStory || typeof rawStory !== 'object') {
    throw new Error('DTO_SANITIZATION_FAILED: Invalid raw story payload received.');
  }

  const story = rawStory as Record<string, unknown>;

  // Strip internal database UUIDs, administrative drafts, and unvetted CMS telemetry
  return {
    id: typeof story.id === 'number' ? story.id : 0,
    uuid: String(story.uuid ?? ''),
    name: String(story.name ?? ''),
    slug: String(story.slug ?? ''),
    full_slug: String(story.full_slug ?? ''),
    content: (story.content && typeof story.content === 'object' ? story.content : {}) as Record<
      string,
      unknown
    >,
    data: {} as ISbStory['data'],
    headers: {} as ISbStory['headers'],
  };
};
