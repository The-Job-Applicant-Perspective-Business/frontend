// components/TabbedInterface.tsx
'use client';
import { useState, useRef, KeyboardEvent } from 'react';
import { SearchInput } from './SearchInput';

export const TabbedInterface = () => {
  const [activeTab, setActiveTab] = useState<'classified' | 'review'>('classified');
  const classifiedTabRef = useRef<HTMLButtonElement>(null);
  const reviewTabRef = useRef<HTMLButtonElement>(null);

  const handleKeyDown = (
    e: KeyboardEvent<HTMLButtonElement>,
    currentTab: 'classified' | 'review',
  ) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      e.preventDefault();
      if (currentTab === 'classified') {
        setActiveTab('review');
        reviewTabRef.current?.focus();
      } else {
        setActiveTab('classified');
        classifiedTabRef.current?.focus();
      }
    }
  };

  return (
    <div dir="ltr" data-orientation="horizontal" className="relative flex w-full flex-col">
      <div
        role="tablist"
        aria-orientation="horizontal"
        className="border-border bg-background mx-auto flex justify-center gap-2 rounded-lg border p-1"
      >
        <button
          ref={classifiedTabRef}
          type="button"
          role="tab"
          aria-selected={activeTab === 'classified'}
          aria-controls="panel-classified"
          id="tab-classified"
          tabIndex={activeTab === 'classified' ? 0 : -1}
          onClick={() => setActiveTab('classified')}
          onKeyDown={(e) => handleKeyDown(e, 'classified')}
          className={`focus-visible:ring-focus-ring w-40 rounded-lg px-6 py-2 text-sm font-bold transition-all focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none lg:w-48 lg:text-base ${
            activeTab === 'classified'
              ? 'bg-primary text-white shadow-md'
              : 'bg-background text-muted-foreground hover:bg-muted'
          }`}
        >
          Classified
        </button>
        <button
          ref={reviewTabRef}
          type="button"
          role="tab"
          aria-selected={activeTab === 'review'}
          aria-controls="panel-review"
          id="tab-review"
          tabIndex={activeTab === 'review' ? 0 : -1}
          onClick={() => setActiveTab('review')}
          onKeyDown={(e) => handleKeyDown(e, 'review')}
          className={`w-40 rounded-lg px-6 py-2 text-sm font-bold transition-all focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none lg:w-48 lg:text-base ${
            activeTab === 'review'
              ? 'bg-primary text-white shadow-md'
              : 'bg-background text-muted-foreground hover:bg-muted'
          }`}
        >
          Hiring Feedback
        </button>
      </div>

      <div className="mt-8 mb-10 w-full md:mt-12 md:mb-16">
        <div
          role="tabpanel"
          id="panel-classified"
          aria-labelledby="tab-classified"
          hidden={activeTab !== 'classified'}
          className="focus-visible:ring-focus-ring w-full focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
        >
          <div className="flex w-full flex-col gap-5 lg:flex-row xl:gap-12">
            <div className="w-full lg:w-full xl:w-1/2">
              <SearchInput />
              {/* Tokenized scrollable container: h-100 (25rem / 400px) */}
              {/* 
              WCAG 2.1.1: Scrollable container must receive focus so keyboard-only 
              users can scroll through overflow content using arrow keys.
            */}

              <div
                /* eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex */
                tabIndex={0}
                role="region"
                aria-label="Search results list"
                className="focus-visible:ring-focus-ring mt-4 flex h-100 flex-col gap-2 overflow-y-auto rounded-md focus-visible:ring-2 focus-visible:outline-none md:gap-3"
              >
                {/* Search Results Render Here */}
                <p className="text-muted-foreground mt-8 text-center">
                  No local search results configured.
                </p>
              </div>
            </div>
            {/* Tokenized placeholder container: lg:h-175 (43.75rem / 700px) */}
            <div className="border-border bg-muted hidden w-full items-center justify-center rounded-lg border lg:flex lg:h-175 xl:w-1/2">
              <h3 className="text-primary font-bold">Map Interface Placeholder</h3>
            </div>
          </div>
        </div>

        <div
          role="tabpanel"
          id="panel-review"
          aria-labelledby="tab-review"
          hidden={activeTab !== 'review'}
          className="focus-visible:ring-focus-ring w-full focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
        >
          <p className="text-muted-foreground text-center">
            Hiring Feedback functionality isolated.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TabbedInterface;
