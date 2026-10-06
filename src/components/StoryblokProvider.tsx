'use client';

import { storyblokInit, apiPlugin } from '@storyblok/react/rsc';
import { ReactNode } from 'react';

// 1. Import your strict WCAG 2.2 AA primitives wrapped for Storyblok
import Page from './blocks/Page';
import SbButton from './blocks/SbButton';
import SbInput from './blocks/SbInput';
import NavigationLink from './blocks/NavigationLink';
import FormInput from './blocks/FormInput';
import RichTextContent from './blocks/RichTextContent';
import AuthorSidebar from './blocks/AuthorSidebar';
import SocialMediaIcon from './blocks/SocialMediaIcon';
import GoBackButton from './blocks/GoBackButton';
import ActionButton from './blocks/ActionButton';
import TabButton from './blocks/TabButton';
import JobLinkCard from './blocks/JobLinkCard';
import BlogCard from './blocks/BlogCard';

// 2. The Component Registry: Maps the CMS block string to the React function
const components = {
  page: Page,
  button: SbButton,
  input: SbInput,
  navigation_link: NavigationLink,
  form_input: FormInput,
  rich_text_content: RichTextContent,
  author_sidebar: AuthorSidebar,
  social_media_icon: SocialMediaIcon,
  go_back_button: GoBackButton,
  action_button: ActionButton,
  tab_button: TabButton,
  job_link_card: JobLinkCard,
  blog_card: BlogCard,
};

// 3. Initialize the bridge.
// The accessToken is exposed to the client ONLY for the visual editor draft mode.
storyblokInit({
  accessToken: process.env.NEXT_PUBLIC_STORYBLOK_TOKEN,
  use: [apiPlugin],
  components,
});

interface StoryblokProviderProps {
  children: ReactNode;
}

const StoryblokProvider = ({ children }: StoryblokProviderProps) => {
  // The provider acts as a client-side wrapper to instantiate the Visual Editor bridge
  return <>{children}</>;
};

export default StoryblokProvider;
