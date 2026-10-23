'use client';

import React from 'react';
import { StoryblokComponent, useStoryblokState, type ISbStoryData } from '@storyblok/react';

interface StoryblokStoryWrapperProps {
  story: ISbStoryData;
}

export const StoryblokStoryWrapper = ({ story }: StoryblokStoryWrapperProps) => {
  // Synchronizes live editing changes via the Storyblok Visual Editor bridge
  const liveStory = useStoryblokState(story);

  if (!liveStory?.content) {
    return null;
  }

  return <StoryblokComponent blok={liveStory.content} />;
};

export default StoryblokStoryWrapper;
