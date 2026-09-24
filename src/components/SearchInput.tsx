// components/SearchInput.tsx
'use client';
import { Search, SlidersHorizontal } from 'lucide-react';

export const SearchInput = () => {
  return (
    <section className="flex w-full justify-between gap-2">
      <div className="flex w-full items-center gap-2">
        <div className="focus-within:ring-primary flex w-full items-center gap-4 rounded-lg border border-slate-300 p-4 shadow-sm focus-within:ring-2">
          <Search className="h-5 w-5 text-neutral-400" aria-hidden="true" />
          <input
            id="job-search"
            aria-label="Search classified jobs"
            placeholder="Search"
            className="h-full w-full bg-transparent text-base outline-none"
            type="text"
          />
        </div>
        <button
          aria-label="Filter search results"
          className="focus-visible:ring-primary flex h-14 w-16 items-center justify-center rounded-lg border border-slate-300 p-3 text-neutral-500 shadow-sm transition-colors hover:bg-slate-50 hover:text-neutral-700 focus-visible:ring-2 focus-visible:outline-none"
        >
          <SlidersHorizontal className="h-6 w-6" aria-hidden="true" />
        </button>
      </div>
    </section>
  );
};
