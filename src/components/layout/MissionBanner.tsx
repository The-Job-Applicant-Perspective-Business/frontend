// components/MissionBanner.tsx
import Image from 'next/image';
import Link from 'next/link';

export const MissionBanner = () => {
  return (
    <section
      aria-labelledby="mission-heading"
      className="bg-gradient-to-r from-blue-50 to-indigo-50"
    >
      <div className="relative w-full px-4 py-20 md:px-8 lg:px-12">
        <div className="z-30 container mx-auto flex flex-col items-center justify-center gap-12 md:flex-row lg:gap-24">
          <div className="flex w-full justify-center md:w-1/2">
            <Image
              src="/dall-e-2025-02-11-14-00-51-a-unique-ghost-hunting-character.jpeg"
              alt="Futuristic ghost hunting character representing the search for real jobs"
              width={506}
              height={338}
              className="rounded-lg shadow-md"
            />
          </div>
          <div className="w-full md:w-1/2">
            <h2
              id="mission-heading"
              className="text-foreground text-3xl leading-tight font-semibold md:text-5xl"
            >
              Unveiling our mission
            </h2>
            <p className="text-muted-foreground mt-4 text-lg">
              We are here to transform hiring into a two-stakeholder market. Employers may see job
              seekers as a resource, but we see them as a stakeholder whose needs we must balance
              with employers to ensure an efficient hiring process. Join us in transforming hiring.
            </p>
            <Link
              href="/who-we-are"
              className="group focus-visible:ring-focus-ring mt-6 flex w-fit items-center gap-2 rounded-md p-1 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
            >
              <span className="text-primary font-bold group-hover:underline">
                Know more
                <span className="sr-only"> about our mission</span>
              </span>
              <Image src="/rightarrow.svg" alt="" width={24} height={24} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MissionBanner;
