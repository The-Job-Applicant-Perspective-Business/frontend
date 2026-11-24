'use client';

import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  Bell,
  Briefcase,
  FileText,
  ListFilter,
  LogOut,
  Menu,
  Plus,
  Search,
  User,
  Users,
  X,
} from 'lucide-react';
import { useHrAuth } from './HrAuthProvider';
import { INITIAL_HR_JOB_FILTERS, useHrJobContext, type HrJobFilterValues } from './JobProvider';
import { HR_TOKEN_STORAGE_KEY, HR_USER_STORAGE_KEY } from '@/lib/api/hrSession';

export interface HrJobPosting {
  _id: string;
  jobTitle: string;
  companyName?: string;
  jobType: string;
  workPlaceType: 'remote' | 'onsite' | 'hybrid' | string;
  jobLocation?: string;
  jobSalaryFrom: number;
  jobSalaryTo: number;
  status: 'active' | 'inactive' | 'pending' | 'rejected' | string;
  applicationNumber: number;
  rejectionMessage?: string;
  jobDescription?: string;
  createdAt: string;
}

const getApiBaseUrl = (): string =>
  (process.env.NEXT_PUBLIC_TJAP_API_URL ?? '').trim().replace(/\/+$/, '');

const formatCurrency = (amount: number): string => {
  if (!Number.isFinite(amount)) return '$0';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatDate = (isoDate: string): string => {
  const parsed = new Date(isoDate);
  if (Number.isNaN(parsed.getTime())) return '';
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(parsed);
};

const formatLabel = (raw: string): string =>
  raw.replace(/-/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());

export const HrDashboardWorkspace = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user, isLoading: isAuthLoading } = useHrAuth();
  const {
    filterValues,
    setFilterValues,
    filtersApplied,
    setFiltersApplied,
    resetFilters,
    setSelectedJobId,
  } = useHrJobContext();

  const activeTab: 'approved' | 'pending' =
    searchParams.get('tab') === 'pending' ? 'pending' : 'approved';

  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [draftFilters, setDraftFilters] = useState<HrJobFilterValues>(INITIAL_HR_JOB_FILTERS);

  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const [jobs, setJobs] = useState<HrJobPosting[]>([]);
  const [isJobsLoading, setIsJobsLoading] = useState(true);
  const [jobsError, setJobsError] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  // Redirect unauthenticated sessions to /login once HrAuthProvider finishes hydrating
  useEffect(() => {
    if (isAuthLoading) return;
    const storedToken =
      typeof window !== 'undefined' ? window.localStorage.getItem(HR_TOKEN_STORAGE_KEY) : null;
    if (!user && !storedToken) {
      router.replace('/login');
    }
  }, [isAuthLoading, user, router]);

  // 500ms debounce matching extracted Chunk 707 search cadence
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(searchInput.trim());
    }, 500);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  const activeFilterCount = useMemo(
    () =>
      [
        filterValues.location,
        filterValues.jobType,
        filterValues.datePosted,
        filterValues.salary,
        filterValues.workPlaceType,
      ].filter(Boolean).length,
    [filterValues],
  );

  const fetchJobs = useCallback(async () => {
    const token =
      typeof window !== 'undefined' ? window.localStorage.getItem(HR_TOKEN_STORAGE_KEY) : null;
    if (!token) return;

    setIsJobsLoading(true);
    setJobsError(null);

    try {
      const apiBaseUrl = getApiBaseUrl();
      const url = new URL(`${apiBaseUrl}/api/v1/jobs`, window.location.origin);
      url.searchParams.set('page', '1');
      url.searchParams.set('limit', '30');

      const statuses = activeTab === 'approved' ? ['active', 'inactive'] : ['pending', 'rejected'];
      statuses.forEach((st) => url.searchParams.append('status', st));

      if (debouncedSearch) url.searchParams.set('search', debouncedSearch);
      if (filterValues.salary) url.searchParams.set('jobSalary', filterValues.salary);
      if (filterValues.location) url.searchParams.set('jobLocation', filterValues.location);
      if (filterValues.datePosted) url.searchParams.set('datePosted', filterValues.datePosted);
      if (filterValues.workPlaceType) {
        url.searchParams.set('workPlaceType', filterValues.workPlaceType);
      }
      if (filterValues.jobType) {
        url.searchParams.append('jobType', filterValues.jobType);
      }

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        window.localStorage.removeItem(HR_TOKEN_STORAGE_KEY);
        window.localStorage.removeItem(HR_USER_STORAGE_KEY);
        router.replace('/login');
        return;
      }

      const rawPayload: unknown = await response.json().catch(() => null);
      if (!response.ok) {
        const errorBody = rawPayload as { message?: string } | null;
        throw new Error(errorBody?.message ?? 'Unable to load job postings.');
      }

      const dataEnvelope = rawPayload as { data?: unknown } | null;
      const list = Array.isArray(dataEnvelope?.data) ? (dataEnvelope.data as HrJobPosting[]) : [];
      setJobs(list);
    } catch (error) {
      setJobsError(error instanceof Error ? error.message : 'Unable to load job postings.');
      setJobs([]);
    } finally {
      setIsJobsLoading(false);
    }
  }, [activeTab, debouncedSearch, filterValues, router]);

  useEffect(() => {
    void Promise.resolve().then(fetchJobs);
  }, [fetchJobs]);

  useEffect(() => {
    const token =
      typeof window !== 'undefined' ? window.localStorage.getItem(HR_TOKEN_STORAGE_KEY) : null;
    if (!token) return;

    const loadUnreadCount = async () => {
      try {
        const apiBaseUrl = getApiBaseUrl();
        const response = await fetch(`${apiBaseUrl}/api/v1/notifications/unread-count`, {
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) return;
        const payload = (await response.json().catch(() => null)) as {
          data?: number | { count?: number };
        } | null;
        if (typeof payload?.data === 'number') {
          setUnreadCount(payload.data);
        } else if (payload?.data && typeof payload.data.count === 'number') {
          setUnreadCount(payload.data.count);
        }
      } catch {
        // Non-blocking telemetry badge
      }
    };

    void loadUnreadCount();
  }, []);

  const handleTabChange = (nextTab: 'approved' | 'pending') => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', nextTab);
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleApplyFilters = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFilterValues(draftFilters);
    const hasAny = Object.values(draftFilters).some((val) => val.trim().length > 0);
    setFiltersApplied(hasAny);
    setFilterPanelOpen(false);
  };

  const handleClearAllSearchAndFilters = () => {
    setSearchInput('');
    setDebouncedSearch('');
    setDraftFilters(INITIAL_HR_JOB_FILTERS);
    resetFilters();
  };

  const handleLogout = async () => {
    const token =
      typeof window !== 'undefined' ? window.localStorage.getItem(HR_TOKEN_STORAGE_KEY) : null;
    try {
      if (token) {
        const apiBaseUrl = getApiBaseUrl();
        await fetch(`${apiBaseUrl}/api/v1/auth/logout`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }
    } finally {
      window.localStorage.removeItem(HR_TOKEN_STORAGE_KEY);
      window.localStorage.removeItem(HR_USER_STORAGE_KEY);
      router.replace('/login');
    }
  };

  if (isAuthLoading) {
    return (
      <main
        id="main-content"
        className="flex min-h-screen w-full items-center justify-center bg-[#F8FAFC] p-6"
      >
        <p role="status" className="text-base font-semibold text-[#0D3276]">
          Verifying HR session...
        </p>
      </main>
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-white lg:flex-row">
      {/* Desktop Sidebar */}
      <aside
        aria-label="HR Portal Navigation"
        className="hidden h-screen w-[270px] shrink-0 flex-col border-r border-[#E7EBF1] bg-white shadow-[0_19px_40px_rgba(143,143,143,0.12)] lg:sticky lg:top-0 lg:flex"
      >
        <div className="mt-10 flex w-full justify-center px-6">
          <Link
            href="/"
            className="inline-flex items-center rounded-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0D3276]"
          >
            <Image
              src="/logosm.svg"
              alt="The Job Applicant Perspective HR"
              width={180}
              height={32}
              priority
              className="h-auto w-[180px]"
            />
          </Link>
        </div>

        <nav aria-label="Primary Workspace" className="mt-14 flex w-full flex-col items-end gap-3">
          <Link
            href="/"
            aria-current="page"
            className="flex w-[238px] items-center gap-3 rounded-l-lg bg-[#0D3276] py-3 pl-5 text-base font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0D3276]"
          >
            <Briefcase className="h-5 w-5" aria-hidden="true" />
            <span>My postings</span>
          </Link>

          <Link
            href="/job-applications"
            className="flex w-[238px] items-center gap-3 rounded-l-lg py-3 pl-5 text-base font-semibold text-[#434343] transition-colors hover:bg-[#F1F5F9] hover:text-[#0D3276] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0D3276]"
          >
            <FileText className="h-5 w-5" aria-hidden="true" />
            <span>Job applications</span>
          </Link>
        </nav>
      </aside>

      {/* Mobile Drawer */}
      {mobileNavOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="HR Navigation Menu"
          className="fixed inset-0 z-50 flex bg-black/40 lg:hidden"
        >
          <div className="flex h-full w-72 flex-col bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <Image
                src="/logosm.svg"
                alt="The Job Applicant Perspective HR"
                width={168}
                height={30}
                className="h-auto w-[168px]"
              />
              <button
                type="button"
                onClick={() => setMobileNavOpen(false)}
                aria-label="Close navigation menu"
                className="rounded-md p-2 text-[#434343] hover:bg-[#F1F5F9] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0D3276]"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            <nav aria-label="Mobile Workspace" className="mt-8 flex flex-col gap-2">
              <Link
                href="/"
                aria-current="page"
                onClick={() => setMobileNavOpen(false)}
                className="flex items-center gap-3 rounded-lg bg-[#0D3276] px-4 py-3 text-base font-semibold text-white"
              >
                <Briefcase className="h-5 w-5" aria-hidden="true" />
                <span>My postings</span>
              </Link>
              <Link
                href="/job-applications"
                onClick={() => setMobileNavOpen(false)}
                className="flex items-center gap-3 rounded-lg px-4 py-3 text-base font-semibold text-[#434343] hover:bg-[#F1F5F9]"
              >
                <FileText className="h-5 w-5" aria-hidden="true" />
                <span>Job applications</span>
              </Link>
            </nav>

            <button
              type="button"
              onClick={() => void handleLogout()}
              className="mt-auto flex items-center gap-3 rounded-lg border border-[#D0D9E9] px-4 py-3 text-base font-semibold text-[#B91C1C] hover:bg-red-50"
            >
              <LogOut className="h-5 w-5" aria-hidden="true" />
              <span>Sign out</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Content Shell */}
      <div className="flex w-full min-w-0 flex-col px-4 md:px-8">
        {/* Mobile Header */}
        <header className="flex items-center justify-between py-6 lg:hidden">
          <p className="text-xl font-bold text-[#121212]">My postings</p>
          <button
            type="button"
            onClick={() => setMobileNavOpen(true)}
            aria-label="Open navigation menu"
            aria-expanded={mobileNavOpen}
            className="rounded-lg border border-[#D0D9E9] p-2.5 text-[#0D3276] hover:bg-[#F1F5F9] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0D3276]"
          >
            <Menu className="h-6 w-6" aria-hidden="true" />
          </button>
        </header>

        {/* Desktop Top Bar */}
        <header className="mt-7 hidden w-full items-center justify-between border-b border-[#E7EBF1] pb-4 lg:flex">
          <h1 className="text-2xl font-bold text-[#121212]">My job postings</h1>

          <div className="flex items-center gap-4">
            <button
              type="button"
              aria-label={
                unreadCount > 0 ? `Notifications (${unreadCount} unread)` : 'Notifications'
              }
              className="relative rounded-lg p-2 text-[#434343] hover:bg-[#F1F5F9] hover:text-[#0D3276] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0D3276]"
            >
              <Bell className="h-5 w-5" aria-hidden="true" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#0D3276] px-1 text-[10px] font-bold text-white">
                  {unreadCount}
                </span>
              )}
            </button>

            <span aria-hidden="true" className="text-2xl text-[#D9D9D9]">
              |
            </span>

            <div className="relative">
              <button
                type="button"
                onClick={() => setUserMenuOpen((prev) => !prev)}
                aria-expanded={userMenuOpen}
                aria-haspopup="menu"
                className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-base font-bold text-[#374151] hover:bg-[#F1F5F9] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0D3276]"
              >
                <User className="h-4 w-4 text-[#0D3276]" aria-hidden="true" />
                <span>{user?.name ?? 'HR Account'}</span>
              </button>

              {userMenuOpen && (
                <div
                  role="menu"
                  className="absolute right-0 z-30 mt-2 w-48 rounded-lg border border-[#D0D9E9] bg-white py-1.5 shadow-lg"
                >
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => void handleLogout()}
                    className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm font-semibold text-[#B91C1C] hover:bg-red-50"
                  >
                    <LogOut className="h-4 w-4" aria-hidden="true" />
                    <span>Sign out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Primary Landmark */}
        <main
          id="main-content"
          tabIndex={-1}
          className="w-full flex-grow border-t border-[#E7EBF1] pt-4 focus:outline-none md:mt-5 md:border-t-0 md:pt-0"
        >
          {/* Mobile Screen-Reader / Visual H1 Parity */}
          <h1 className="sr-only lg:hidden">My job postings</h1>

          {/* Status Tabs */}
          <div
            role="tablist"
            aria-label="Job posting status"
            className="inline-flex w-full max-w-[356px] items-center rounded-md bg-[#F8FAFC] p-1"
          >
            <button
              type="button"
              role="tab"
              id="tab-approved"
              aria-selected={activeTab === 'approved'}
              aria-controls="panel-postings"
              onClick={() => handleTabChange('approved')}
              className={`w-1/2 rounded-[5px] px-4 py-2 text-base font-bold transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0D3276] ${
                activeTab === 'approved'
                  ? 'bg-[#E7EBF1] text-[#0D3276] shadow-sm'
                  : 'text-[#595959] hover:text-[#111827]'
              }`}
            >
              Approved
            </button>

            <button
              type="button"
              role="tab"
              id="tab-pending"
              aria-selected={activeTab === 'pending'}
              aria-controls="panel-postings"
              onClick={() => handleTabChange('pending')}
              className={`w-1/2 rounded-[5px] px-4 py-2 text-base font-bold transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0D3276] ${
                activeTab === 'pending'
                  ? 'bg-[#E7EBF1] text-[#0D3276] shadow-sm'
                  : 'text-[#595959] hover:text-[#111827]'
              }`}
            >
              Under review
            </button>
          </div>

          {/* Search, Filter & Primary Action Toolbar */}
          <div className="mt-5 flex flex-col justify-between gap-3 md:flex-row md:items-center">
            <div className="flex w-full max-w-[450px] items-center gap-2">
              <div className="flex h-11 w-full items-center gap-3 rounded-lg border border-[#D0D9E9] bg-white px-4 shadow-[0_8px_26px_rgba(0,0,0,0.05)] focus-within:border-[#0D3276]">
                <Search className="h-4 w-4 shrink-0 text-[#595959]" aria-hidden="true" />
                <label htmlFor="hr-postings-search" className="sr-only">
                  Search job postings
                </label>
                <input
                  id="hr-postings-search"
                  type="search"
                  placeholder="Search"
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                  className="w-full bg-transparent text-base text-[#111827] placeholder:text-[#595959] focus:outline-none"
                />
                {searchInput.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchInput('');
                      setDebouncedSearch('');
                    }}
                    aria-label="Clear search query"
                    className="rounded p-1 text-[#595959] hover:text-[#111827] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0D3276]"
                  >
                    <X className="h-4 w-4" aria-hidden="true" />
                  </button>
                )}
              </div>

              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setDraftFilters(filterValues);
                    setFilterPanelOpen((prev) => !prev);
                  }}
                  aria-label="Filter job postings"
                  aria-expanded={filterPanelOpen}
                  className={`flex h-11 w-13 items-center justify-center rounded-lg border bg-white shadow-[0_8px_26px_rgba(0,0,0,0.05)] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0D3276] ${
                    filtersApplied
                      ? 'border-2 border-[#0D3276] text-[#0D3276]'
                      : 'border-[#D0D9E9] text-[#434343] hover:text-[#0D3276]'
                  }`}
                >
                  <ListFilter className="h-5 w-5" aria-hidden="true" />
                </button>
                {activeFilterCount > 0 && (
                  <span className="pointer-events-none absolute -top-1.5 -right-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#0D3276] px-1 text-[11px] font-bold text-white">
                    {activeFilterCount}
                  </span>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSelectedJobId('new')}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#0D3276] px-5 py-2.5 text-base font-semibold text-white transition-colors hover:bg-[#081F48] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0D3276]"
            >
              <Plus className="h-5 w-5" aria-hidden="true" />
              <span>Post a job</span>
            </button>
          </div>

          {/* Collapsible Filter Panel */}
          {filterPanelOpen && (
            <form
              onSubmit={handleApplyFilters}
              aria-label="Filter job postings"
              className="mt-4 rounded-xl border border-[#D0D9E9] bg-[#F8FAFC] p-5"
            >
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="flex flex-col gap-1">
                  <label
                    htmlFor="hr-filter-workplace"
                    className="text-sm font-semibold text-[#374151]"
                  >
                    Workplace
                  </label>
                  <select
                    id="hr-filter-workplace"
                    value={draftFilters.workPlaceType}
                    onChange={(event) =>
                      setDraftFilters((prev) => ({ ...prev, workPlaceType: event.target.value }))
                    }
                    className="h-11 rounded-lg border border-[#D0D9E9] bg-white px-3 text-sm text-[#111827]"
                  >
                    <option value="">All workplaces</option>
                    <option value="remote">Remote</option>
                    <option value="onsite">Onsite</option>
                    <option value="hybrid">Hybrid</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label htmlFor="hr-filter-type" className="text-sm font-semibold text-[#374151]">
                    Job type
                  </label>
                  <select
                    id="hr-filter-type"
                    value={draftFilters.jobType}
                    onChange={(event) =>
                      setDraftFilters((prev) => ({ ...prev, jobType: event.target.value }))
                    }
                    className="h-11 rounded-lg border border-[#D0D9E9] bg-white px-3 text-sm text-[#111827]"
                  >
                    <option value="">All job types</option>
                    <option value="full-time">Full time</option>
                    <option value="part-time">Part time</option>
                    <option value="internship">Internship</option>
                    <option value="contract">Contract</option>
                    <option value="seasonal">Seasonal</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label htmlFor="hr-filter-date" className="text-sm font-semibold text-[#374151]">
                    Date posted
                  </label>
                  <select
                    id="hr-filter-date"
                    value={draftFilters.datePosted}
                    onChange={(event) =>
                      setDraftFilters((prev) => ({ ...prev, datePosted: event.target.value }))
                    }
                    className="h-11 rounded-lg border border-[#D0D9E9] bg-white px-3 text-sm text-[#111827]"
                  >
                    <option value="">Any time</option>
                    <option value="last-24-hours">Last 24 hours</option>
                    <option value="last-3-days">Last 3 days</option>
                    <option value="last-7-days">Last 7 days</option>
                    <option value="last-30-days">Last 30 days</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label
                    htmlFor="hr-filter-salary"
                    className="text-sm font-semibold text-[#374151]"
                  >
                    Minimum salary (USD)
                  </label>
                  <input
                    id="hr-filter-salary"
                    type="text"
                    inputMode="numeric"
                    placeholder="e.g. 75000"
                    value={draftFilters.salary}
                    onChange={(event) =>
                      setDraftFilters((prev) => ({
                        ...prev,
                        salary: event.target.value.replace(/[^0-9]/g, ''),
                      }))
                    }
                    className="h-11 rounded-lg border border-[#D0D9E9] bg-white px-3 text-sm text-[#111827] placeholder:text-[#595959]"
                  />
                </div>
              </div>

              {draftFilters.workPlaceType === 'onsite' && (
                <div className="mt-4 flex flex-col gap-1 sm:max-w-xs">
                  <label
                    htmlFor="hr-filter-location"
                    className="text-sm font-semibold text-[#374151]"
                  >
                    Onsite city / location
                  </label>
                  <input
                    id="hr-filter-location"
                    type="text"
                    placeholder="City, State"
                    value={draftFilters.location}
                    onChange={(event) =>
                      setDraftFilters((prev) => ({ ...prev, location: event.target.value }))
                    }
                    className="h-11 rounded-lg border border-[#D0D9E9] bg-white px-3 text-sm text-[#111827] placeholder:text-[#595959]"
                  />
                </div>
              )}

              <div className="mt-4 flex justify-end gap-3">
                {filtersApplied && (
                  <button
                    type="button"
                    onClick={() => {
                      setDraftFilters(INITIAL_HR_JOB_FILTERS);
                      resetFilters();
                      setFilterPanelOpen(false);
                    }}
                    className="rounded-lg border border-[#595959] bg-white px-4 py-2 text-sm font-semibold text-[#374151] hover:bg-[#F1F5F9]"
                  >
                    Clear filters
                  </button>
                )}
                <button
                  type="submit"
                  className="rounded-lg bg-[#0D3276] px-5 py-2 text-sm font-semibold text-white hover:bg-[#081F48]"
                >
                  Apply
                </button>
              </div>
            </form>
          )}

          {/* Postings Tab Panel */}
          <div
            id="panel-postings"
            role="tabpanel"
            aria-labelledby={activeTab === 'approved' ? 'tab-approved' : 'tab-pending'}
            className="mt-5 pb-10"
          >
            {jobsError && (
              <div
                role="alert"
                className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm font-medium text-red-900"
              >
                {jobsError}
              </div>
            )}

            {isJobsLoading ? (
              <div role="status" className="space-y-3">
                <div className="h-32 w-full animate-pulse rounded-xl bg-[#F1F5F9]" />
                <div className="h-32 w-full animate-pulse rounded-xl bg-[#F1F5F9]" />
                <span className="sr-only">Loading job postings...</span>
              </div>
            ) : jobs.length > 0 ? (
              <ul className="space-y-3">
                {jobs.map((job) => {
                  const statusLabel =
                    job.status === 'pending' ? 'Under Review' : formatLabel(job.status);
                  const statusStyle =
                    job.status === 'active'
                      ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                      : job.status === 'rejected'
                        ? 'bg-red-50 text-red-900 border-red-300'
                        : 'bg-amber-50 text-amber-900 border-amber-300';

                  return (
                    <li key={job._id}>
                      <button
                        type="button"
                        onClick={() => setSelectedJobId(job._id)}
                        className="flex w-full flex-col justify-between gap-4 rounded-xl border-2 border-[#E7EBF1] bg-white p-5 text-left shadow-[0_8px_35px_rgba(0,0,0,0.04)] transition-colors hover:border-[#0D3276] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0D3276] md:flex-row-reverse"
                      >
                        <div className="flex items-center justify-between md:flex-col md:items-end">
                          <p className="text-sm font-medium text-[#595959]">
                            {formatDate(job.createdAt)}
                          </p>
                          <p className="flex items-center gap-1.5 text-sm font-bold text-[#0D3276]">
                            <Users className="h-4 w-4" aria-hidden="true" />
                            <span>
                              {job.applicationNumber}{' '}
                              {job.applicationNumber === 1 ? 'Applicant' : 'Applicants'}
                            </span>
                          </p>
                        </div>

                        <div>
                          <span
                            className={`inline-block rounded-md border px-2.5 py-0.5 text-xs font-bold ${statusStyle}`}
                          >
                            {statusLabel}
                          </span>

                          <h2 className="mt-2.5 text-lg font-bold text-[#121212] md:text-2xl">
                            {job.jobTitle}
                          </h2>

                          {job.companyName && (
                            <p className="mt-0.5 text-sm font-bold text-[#595959]">
                              {job.companyName}
                            </p>
                          )}

                          <dl className="mt-4 flex flex-wrap gap-6 md:gap-12">
                            <div>
                              <dd className="text-sm font-bold text-[#374151] md:text-base">
                                {formatCurrency(job.jobSalaryFrom)} -{' '}
                                {formatCurrency(job.jobSalaryTo)}
                              </dd>
                              <dt className="text-xs font-medium text-[#595959]">Salary Range</dt>
                            </div>

                            <div>
                              <dd className="text-sm font-bold text-[#374151] md:text-base">
                                {formatLabel(job.jobType)}
                              </dd>
                              <dt className="text-xs font-medium text-[#595959]">Job type</dt>
                            </div>

                            <div>
                              <dd className="text-sm font-bold text-[#374151] md:text-base">
                                {job.workPlaceType === 'onsite' && job.jobLocation
                                  ? job.jobLocation
                                  : formatLabel(job.workPlaceType)}
                              </dd>
                              <dt className="text-xs font-medium text-[#595959]">Workplace</dt>
                            </div>
                          </dl>
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="flex min-h-[280px] flex-col items-center justify-center rounded-xl border border-dashed border-[#D0D9E9] p-8 text-center">
                <h2 className="text-lg font-bold text-[#0D3276]">No results found</h2>
                <p className="mt-1 text-sm text-[#595959]">
                  {filtersApplied || debouncedSearch
                    ? 'No job postings match your current search or filter criteria.'
                    : 'You do not have any job postings in this category yet.'}
                </p>
                {(filtersApplied || debouncedSearch) && (
                  <button
                    type="button"
                    onClick={handleClearAllSearchAndFilters}
                    className="mt-3 rounded-lg border border-[#0D3276] px-4 py-2 text-sm font-bold text-[#0D3276] hover:bg-[#F1F5F9]"
                  >
                    Clear search
                  </button>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};
