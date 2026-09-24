// components/TabbedInterface.tsx
'use client';
import { useState } from 'react';
import { SearchInput } from './SearchInput';

export const TabbedInterface = () => {
  const [activeTab, setActiveTab] = useState<'classified' | 'review'>('classified');

  return (
    <div dir="ltr" data-orientation="horizontal" className="relative flex w-full flex-col">
      <div
        role="tablist"
        aria-orientation="horizontal"
        className="mx-auto flex justify-center gap-2 rounded-lg border border-slate-300 bg-white p-1"
      >
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'classified'}
          aria-controls="panel-classified"
          id="tab-classified"
          onClick={() => setActiveTab('classified')}
          className={`focus-visible:ring-ring w-40 rounded-lg px-6 py-2 text-sm font-bold transition-all focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none lg:w-48 lg:text-base ${
            activeTab === 'classified'
              ? 'bg-primary text-white shadow-md'
              : 'bg-white text-neutral-600 hover:bg-slate-100'
          }`}
        >
          Classified
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'review'}
          aria-controls="panel-review"
          id="tab-review"
          onClick={() => setActiveTab('review')}
          className={`focus-visible:ring-ring w-40 rounded-lg px-6 py-2 text-sm font-bold transition-all focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none lg:w-48 lg:text-base ${
            activeTab === 'review'
              ? 'bg-primary text-white shadow-md'
              : 'bg-white text-neutral-600 hover:bg-slate-100'
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
          className="focus-visible:ring-ring w-full focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
        >
          <div className="flex w-full flex-col gap-5 lg:flex-row xl:gap-12">
            <div className="w-full lg:w-full xl:w-1/2">
              <SearchInput />
              <div className="mt-4 flex h-[400px] flex-col gap-2 overflow-y-auto md:gap-3">
                {/* Search Results Render Here */}
                <p className="mt-8 text-center text-neutral-500">
                  No local search results configured.
                </p>
              </div>
            </div>
            <div className="hidden w-full items-center justify-center rounded-lg border border-slate-200 bg-slate-50 lg:flex lg:h-[700px] xl:w-1/2">
              <h3 className="text-primary font-bold">Map Interface Placeholder</h3>
            </div>
          </div>
        </div>

        <div
          role="tabpanel"
          id="panel-review"
          aria-labelledby="tab-review"
          hidden={activeTab !== 'review'}
          className="focus-visible:ring-ring w-full focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
        >
          <p className="text-center text-neutral-600">Hiring Feedback functionality isolated.</p>
        </div>
      </div>
    </div>
  );
};
