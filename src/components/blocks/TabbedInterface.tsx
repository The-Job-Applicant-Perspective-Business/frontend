'use client';

import React, { useState, useTransition } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Search, X, SlidersHorizontal, ChevronDown, Star } from 'lucide-react';

interface MockJob {
  id: string;
  title: string;
  company: string;
  location: string;
  salary?: string;
  workPlaceType?: string;
  datePosted?: string;
}

interface MockReview {
  id: string;
  companyName: string;
  rating: number;
  reviewCount: number;
  location: string;
  industry: string;
  companySize: string;
}

const MOCK_REVIEWS: MockReview[] = [
  {
    id: '67205213b45946e3433b2de4',
    companyName: 'Michigan Sugar Company',
    rating: 5.0,
    reviewCount: 1,
    location: 'Bay City, Michigan',
    industry: 'Manufacturing & Production',
    companySize: '500+ Employees',
  },
  {
    id: '67bf9247b45946e3433cecc3',
    companyName: 'REI',
    rating: 4.0,
    reviewCount: 1,
    location: 'Kent, Washington',
    industry: 'Retail',
    companySize: '500+ Employees',
  },
  {
    id: '66e60b88a0d90f7cfcae96d8',
    companyName: 'Abbott',
    rating: 4.0,
    reviewCount: 1,
    location: 'Alameda, California',
    industry: 'Medical Devices & Equipment',
    companySize: '500+ Employees',
  },
];

const MOCK_JOBS: MockJob[] = [
  {
    id: 'job-1',
    title: 'Registered Nurse - Acute Care',
    company: 'MyMichigan Health',
    location: 'Midland, MI',
    salary: '$34 - $48 / hr',
    workPlaceType: 'On-site',
    datePosted: '2 days ago',
  },
  {
    id: 'job-2',
    title: 'Youth Program Specialist',
    company: 'Greater Midland',
    location: 'Midland, MI',
    salary: '$18 - $22 / hr',
    workPlaceType: 'On-site',
    datePosted: '4 days ago',
  },
];

export interface TabbedInterfaceProps {
  defaultTab?: 'classified' | 'review';
  className?: string;
}

export const TabbedInterface = ({
  defaultTab = 'classified',
  className = '',
}: TabbedInterfaceProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  // Read current tab from search params or default
  const currentTabParam = searchParams.get('tab');
  const activeTab: 'classified' | 'review' =
    currentTabParam === 'review' || currentTabParam === 'classified' ? currentTabParam : defaultTab;

  // Search state
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [jobs, setJobs] = useState<MockJob[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [reviews] = useState<MockReview[]>(MOCK_REVIEWS);

  // Tab switching updating query params (?jobId=&tab=...)
  const handleTabChange = (tab: 'classified' | 'review') => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      params.set('tab', tab);
      if (!params.has('jobId')) {
        params.set('jobId', '');
      }
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    });
  };

  // Mock search execution against the api.thejobapplicantperspective.com query shape
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setHasSearched(Boolean(query.trim()));

    if (!query.trim()) {
      setJobs([]);
      return;
    }

    // Filter local mock jobs
    const filtered = MOCK_JOBS.filter(
      (job) =>
        job.title.toLowerCase().includes(query.toLowerCase()) ||
        job.company.toLowerCase().includes(query.toLowerCase()),
    );
    setJobs(filtered);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setHasSearched(false);
    setJobs([]);
  };

  return (
    <section
      aria-label="Job Search and Hiring Feedback"
      className={`w-full py-8 ${className}`.trim()}
    >
      <div className="mx-auto flex w-full flex-col items-center justify-center">
        {/* Tab Selection Header */}
        <div
          role="tablist"
          aria-label="Search Mode Selection"
          className="mx-auto flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white p-1 shadow-sm"
        >
          <button
            type="button"
            role="tab"
            id="tab-trigger-classified"
            aria-selected={activeTab === 'classified'}
            aria-controls="tab-content-classified"
            onClick={() => handleTabChange('classified')}
            className={`w-36 rounded-md px-6 py-2.5 text-sm font-bold transition-all focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:outline-none sm:w-48 sm:text-base ${
              activeTab === 'classified'
                ? 'bg-[#0D3276] text-white shadow-md'
                : 'bg-white text-slate-600 hover:text-slate-900'
            }`}
          >
            Classified
          </button>
          <button
            type="button"
            role="tab"
            id="tab-trigger-review"
            aria-selected={activeTab === 'review'}
            aria-controls="tab-content-review"
            onClick={() => handleTabChange('review')}
            className={`w-36 rounded-md px-6 py-2.5 text-sm font-bold transition-all focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:outline-none sm:w-48 sm:text-base ${
              activeTab === 'review'
                ? 'bg-[#0D3276] text-white shadow-md'
                : 'bg-white text-slate-600 hover:text-slate-900'
            }`}
          >
            Hiring Feedback
          </button>
        </div>

        {/* Tab Panels */}
        <div className="mt-8 w-full md:mt-12">
          {/* 1. CLASSIFIED TAB CONTENT */}
          {activeTab === 'classified' && (
            <div
              role="tabpanel"
              id="tab-content-classified"
              aria-labelledby="tab-trigger-classified"
              className="flex w-full flex-col gap-6 lg:flex-row lg:gap-12"
            >
              {/* Left Column: Search & Results Scroll */}
              <div className="w-full lg:w-1/2">
                {/* Search Bar Input */}
                <div className="flex w-full items-center gap-2">
                  <div className="relative flex flex-1 items-center rounded-lg border border-slate-300 bg-white px-4 py-3 shadow-sm">
                    <Search className="h-5 w-5 text-slate-400" aria-hidden="true" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => handleSearch(e.target.value)}
                      placeholder="Search jobs..."
                      aria-label="Search classified jobs"
                      className="ml-3 w-full bg-transparent text-base text-slate-800 placeholder-slate-400 focus:outline-none"
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={handleClearSearch}
                        aria-label="Clear search query"
                        className="p-1 text-slate-400 hover:text-slate-600 focus:outline-none"
                      >
                        <X className="h-5 w-5" aria-hidden="true" />
                      </button>
                    )}
                  </div>
                  <button
                    type="button"
                    aria-label="Open filter options"
                    className="flex h-12 w-14 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-500 shadow-sm hover:text-slate-700 focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:outline-none"
                  >
                    <SlidersHorizontal className="h-5 w-5" aria-hidden="true" />
                  </button>
                </div>

                {/* Results Container / Empty State */}
                <div className="mt-4 min-h-[300px] w-full overflow-y-auto rounded-lg border border-slate-100 bg-slate-50/50 p-4 lg:h-[670px]">
                  {jobs.length > 0 ? (
                    <ul className="m-0 flex list-none flex-col gap-3 p-0">
                      {jobs.map((job) => (
                        <li
                          key={job.id}
                          className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition-colors hover:border-blue-400"
                        >
                          <h3 className="text-lg font-bold text-slate-900">{job.title}</h3>
                          <p className="text-sm font-semibold text-blue-700">{job.company}</p>
                          <div className="mt-2 flex flex-wrap gap-4 text-xs text-slate-500">
                            <span>{job.location}</span>
                            {job.salary && <span>• {job.salary}</span>}
                            {job.workPlaceType && <span>• {job.workPlaceType}</span>}
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="flex h-full min-h-[250px] flex-col items-center justify-center text-center">
                      <p className="text-lg font-bold text-blue-900">
                        {hasSearched ? 'No results found' : '0 jobs found ?'}
                      </p>
                      {hasSearched && (
                        <button
                          type="button"
                          onClick={handleClearSearch}
                          className="mt-2 text-sm font-semibold text-blue-700 hover:underline focus:outline-none"
                        >
                          Clear search
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Hero Graphic / Placeholder Display */}
              <div className="hidden w-full items-center justify-center rounded-lg border border-slate-100 bg-slate-50/30 p-8 lg:flex lg:h-[730px] lg:w-1/2">
                <div className="flex flex-col items-center justify-center text-center">
                  <div className="flex h-48 w-48 items-center justify-center rounded-full bg-blue-50 text-blue-300">
                    <Search className="h-20 w-20" aria-hidden="true" />
                  </div>
                  <p className="mt-4 text-sm font-bold text-slate-500">
                    Select a job to view complete candidate intelligence
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 2. HIRING FEEDBACK TAB CONTENT */}
          {activeTab === 'review' && (
            <div
              role="tabpanel"
              id="tab-content-review"
              aria-labelledby="tab-trigger-review"
              className="flex w-full flex-col"
            >
              {/* Filter Bar */}
              <div className="mx-auto flex w-full max-w-4xl items-center gap-2">
                <div className="relative flex flex-1 items-center rounded-lg border border-slate-300 bg-white px-4 py-3 shadow-sm">
                  <Search className="h-5 w-5 text-slate-400" aria-hidden="true" />
                  <input
                    type="text"
                    placeholder="Search companies..."
                    aria-label="Search company feedback"
                    className="ml-3 w-full bg-transparent text-base text-slate-800 placeholder-slate-400 focus:outline-none"
                  />
                </div>
                <div className="hidden md:flex">
                  <button
                    type="button"
                    className="flex h-12 w-60 items-center justify-between rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-700 shadow-sm focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:outline-none"
                  >
                    <span>Companies &amp; Job titles</span>
                    <ChevronDown className="h-4 w-4 text-slate-400" aria-hidden="true" />
                  </button>
                </div>
                <button
                  type="button"
                  aria-label="Open filter options"
                  className="flex h-12 w-14 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-500 shadow-sm hover:text-slate-700 focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:outline-none md:hidden"
                >
                  <SlidersHorizontal className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>

              {/* Review Cards Grid */}
              <div className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-6">
                {reviews.map((review) => (
                  <Link
                    key={review.id}
                    href={`/reviews/${review.id}?search=`}
                    className="group block rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:border-blue-400 hover:shadow-md focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:outline-none"
                  >
                    <div className="flex flex-col-reverse justify-between gap-1 sm:flex-row sm:items-center">
                      <h3 className="text-xl font-bold text-slate-900 transition-colors group-hover:text-blue-700">
                        {review.companyName}
                      </h3>
                      <div className="flex items-center gap-1 text-amber-500">
                        <span className="text-base font-bold text-slate-900">
                          {review.rating.toFixed(1)}
                        </span>
                        <Star className="h-5 w-5 fill-current" aria-hidden="true" />
                      </div>
                    </div>
                    <p className="mt-1 text-sm font-semibold text-blue-700">
                      {review.reviewCount} Review{review.reviewCount !== 1 ? 's' : ''} found
                    </p>

                    <div className="mt-6 flex flex-col gap-4 border-t border-slate-100 pt-4 sm:flex-row sm:justify-between">
                      <div>
                        <p className="text-xs font-semibold tracking-wider text-slate-400 uppercase">
                          Location
                        </p>
                        <p className="text-sm font-bold text-slate-800">{review.location}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold tracking-wider text-slate-400 uppercase">
                          Industry
                        </p>
                        <p className="text-sm font-bold text-slate-800">{review.industry}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold tracking-wider text-slate-400 uppercase">
                          Company Size
                        </p>
                        <p className="text-sm font-bold text-slate-800">{review.companySize}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Pagination Controls */}
              <nav
                aria-label="Reviews Pagination"
                className="mt-10 flex items-center justify-center gap-2 text-sm font-semibold"
              >
                <button
                  type="button"
                  disabled
                  className="cursor-not-allowed rounded-lg border border-slate-200 px-3 py-1.5 text-slate-400 opacity-50"
                >
                  Previous
                </button>
                <button
                  type="button"
                  aria-current="page"
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-900 font-bold text-white"
                >
                  1
                </button>
                <button
                  type="button"
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                >
                  2
                </button>
                <span className="px-1 text-slate-400" aria-hidden="true">
                  ...
                </span>
                <button
                  type="button"
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                >
                  207
                </button>
                <button
                  type="button"
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-slate-700 hover:bg-slate-50"
                >
                  Next
                </button>
              </nav>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default TabbedInterface;
