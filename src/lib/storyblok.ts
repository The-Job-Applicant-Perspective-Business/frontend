import { storyblokInit, apiPlugin } from '@storyblok/react/rsc';

export const initStoryblok = () => {
  storyblokInit({
    accessToken: process.env.NEXT_PUBLIC_STORYBLOK_TOKEN,
    use: [apiPlugin],
  });
};
