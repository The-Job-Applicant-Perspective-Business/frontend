// components/SearchInput.tsx
'use client';
import { Search, SlidersHorizontal } from 'lucide-react';

export const SearchInput = () => {
  return (
    <form
      role="search"
      aria-label="Job search"
      onSubmit={(e) => e.preventDefault()}
      className="flex w-full items-center gap-2"
    >
      <div className="border-border bg-background focus-within:border-primary focus-within:ring-focus-ring flex w-full items-center gap-4 rounded-lg border p-4 shadow-sm transition-colors focus-within:ring-2">
        <Search className="text-muted-foreground h-5 w-5" aria-hidden="true" />
        <label htmlFor="job-search" className="sr-only">
          Search classified jobs
        </label>
        <input
          id="job-search"
          type="search"
          placeholder="Search"
          className="text-foreground placeholder:text-muted-foreground h-full w-full bg-transparent text-base focus:outline-none"
        />
      </div>
      <button
        type="button"
        aria-label="Filter search results"
        className="border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:ring-focus-ring flex h-14 w-16 shrink-0 items-center justify-center rounded-lg border p-3 shadow-sm transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
      >
        <SlidersHorizontal className="h-6 w-6" aria-hidden="true" />
      </button>
    </form>
  );
};

export default SearchInput;
