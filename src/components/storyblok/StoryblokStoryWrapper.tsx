'use client';

import React from 'react';
import { StoryblokComponent, useStoryblokState, ISbStoryData } from '@storyblok/react';

interface StoryblokStoryWrapperProps {
  story: ISbStoryData;
}

export const StoryblokStoryWrapper = ({ story }: StoryblokStoryWrapperProps) => {
  // Enables live bridge updating within Storyblok visual editor without server route refresh
  const liveStory = useStoryblokState(story);

  return liveStory ? <StoryblokComponent blok={liveStory.content} /> : null;
};
