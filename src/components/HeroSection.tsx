// components/HeroSection.tsx
export const HeroSection = () => {
  return (
    <div className="h-full w-full border-b border-slate-300 bg-slate-50">
      <div className="flex w-full items-center justify-center bg-transparent px-4 pt-36 md:px-8 lg:px-12 lg:pt-32">
        <div className="mb-14 w-full max-w-2xl text-center md:mb-24 lg:mt-20">
          <h1 className="text-3xl leading-tight font-bold tracking-tight text-neutral-900 lg:text-6xl lg:leading-tight">
            Skip the Recruitment Scams. Find What’s Real.
          </h1>
          <p className="mt-2 text-sm font-normal text-neutral-600 lg:text-lg">
            Fight fake jobs and recruitment scams for your fellow job seekers with your fellow job
            seekers. Anonymous crowdsourced &quot;Google Reviews&quot; of job ads across the U.S.
            organized by company, job title, region, and date.
          </p>
        </div>
      </div>
    </div>
  );
};
