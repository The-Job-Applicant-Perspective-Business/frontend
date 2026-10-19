import React from 'react';
import { StoryblokComponent, storyblokEditable, SbBlokData } from '@storyblok/react';

interface PageBlokProps {
  blok: SbBlokData & {
    body?: SbBlokData[];
  };
}

export const PageBlok = ({ blok }: PageBlokProps) => {
  return (
    <div {...storyblokEditable(blok)} className="flex w-full flex-1 flex-col">
      {blok.body?.map((nestedBlok) => (
        <StoryblokComponent blok={nestedBlok} key={nestedBlok._uid} />
      ))}
    </div>
  );
};
