import { storyblokEditable, StoryblokServerComponent, type SbBlokData } from '@storyblok/react/rsc';

// Extending SbBlokData automatically inherits _uid, component, and the _editable properties
interface PageBlok extends SbBlokData {
  component: 'page';
  body?: SbBlokData[];
}

interface PageProps {
  blok: PageBlok;
}

const Page = ({ blok }: PageProps) => {
  // If the body array is empty or undefined, prevent mapping errors safely
  if (!blok?.body || blok.body.length === 0) {
    return <main {...storyblokEditable(blok)} className="min-h-screen w-full" />;
  }

  return (
    <main {...storyblokEditable(blok)} className="min-h-screen w-full">
      {blok.body.map((nestedBlok) => (
        <StoryblokServerComponent blok={nestedBlok} key={nestedBlok._uid} />
      ))}
    </main>
  );
};

export default Page;
