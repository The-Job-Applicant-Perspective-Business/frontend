'use client';

import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Briefcase, CheckCircle2, Plus, Search, Trash2, Users, X, XCircle } from 'lucide-react';
import { clearAdminSession, getAdminApiBaseUrl, getStoredAdminToken } from '@/lib/api/adminSession';
import { HrUserSchema, type HrUser } from '@/lib/dto/hrAuth';

interface AdminJobItem {
  _id: string;
  jobTitle: string;
  companyName?: string;
  jobType: string;
  workPlaceType: string;
  jobLocation?: string;
  jobSalaryFrom: number;
  jobSalaryTo: number;
  status: string;
  applicationNumber: number;
  createdAt: string;
}

const getJobsEndpoint = (): string =>
  (process.env.NEXT_PUBLIC_TJAP_ADMIN_JOBS_PATH ?? '/api/v1/jobs').trim();

const getUsersEndpoint = (): string =>
  (process.env.NEXT_PUBLIC_TJAP_ADMIN_USERS_PATH ?? '/api/v1/users').trim();

const encodeUtf8Base64 = (rawText: string): string => {
  const htmlWrapped = rawText.trim().startsWith('<')
    ? rawText.trim()
    : `<p>${rawText
        .trim()
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/\n+/g, '</p><p>')}</p>`;
  const bytes = new TextEncoder().encode(htmlWrapped);
  let binary = '';
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return window.btoa(binary);
};

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

export const AdminClassifiedWorkspace = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'approved' | 'pending'>('approved');
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const [jobs, setJobs] = useState<AdminJobItem[]>([]);
  const [hrAccounts, setHrAccounts] = useState<HrUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [statusNotice, setStatusNotice] = useState<string | null>(null);
  const [mutatingJobId, setMutatingJobId] = useState<string | null>(null);

  // Create Job Slide-Over Drawer State
  const [createDrawerOpen, setCreateDrawerOpen] = useState(false);
  const [selectedHrId, setSelectedHrId] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [jobType, setJobType] = useState('full-time');
  const [workPlaceType, setWorkPlaceType] = useState('remote');
  const [jobLocation, setJobLocation] = useState('');
  const [salaryFrom, setSalaryFrom] = useState('');
  const [salaryTo, setSalaryTo] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [drawerError, setDrawerError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(searchInput.trim());
    }, 450);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    if (!createDrawerOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setCreateDrawerOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [createDrawerOpen]);

  const fetchJobs = useCallback(async () => {
    const token = getStoredAdminToken();
    if (!token) return;

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const apiBaseUrl = getAdminApiBaseUrl();
      const url = new URL(`${apiBaseUrl}${getJobsEndpoint()}`, window.location.origin);
      url.searchParams.set('page', '1');
      url.searchParams.set('limit', '50');

      const statuses = activeTab === 'approved' ? ['active', 'inactive'] : ['pending', 'rejected'];
      statuses.forEach((statusVal) => url.searchParams.append('status', statusVal));

      if (debouncedSearch) {
        url.searchParams.set('search', debouncedSearch);
      }

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 401 || response.status === 403) {
        clearAdminSession();
        router.replace('/login');
        return;
      }

      const payload: unknown = await response.json().catch(() => null);
      if (!response.ok) {
        const err = payload as { message?: string } | null;
        throw new Error(err?.message ?? 'Unable to load classified job postings.');
      }

      const envelope = payload as { data?: unknown } | null;
      setJobs(Array.isArray(envelope?.data) ? (envelope.data as AdminJobItem[]) : []);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Unable to load classified job postings.',
      );
      setJobs([]);
    } finally {
      setIsLoading(false);
    }
  }, [activeTab, debouncedSearch, router]);

  const fetchHrAccounts = useCallback(async () => {
    const token = getStoredAdminToken();
    if (!token) return;

    try {
      const apiBaseUrl = getAdminApiBaseUrl();
      const url = new URL(`${apiBaseUrl}${getUsersEndpoint()}`, window.location.origin);
      url.searchParams.set('role', 'hr');
      url.searchParams.set('page', '1');
      url.searchParams.set('limit', '100');

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) return;
      const payload = (await response.json().catch(() => null)) as { data?: unknown } | null;
      if (!Array.isArray(payload?.data)) return;

      const validated: HrUser[] = [];
      payload.data.forEach((item) => {
        const parsed = HrUserSchema.safeParse(item);
        if (parsed.success) {
          validated.push(parsed.data);
        }
      });
      setHrAccounts(validated);
    } catch {
      // Non-blocking HR directory preload
    }
  }, []);

  useEffect(() => {
    void Promise.resolve().then(fetchJobs);
  }, [fetchJobs]);

  useEffect(() => {
    void Promise.resolve().then(fetchHrAccounts);
  }, [fetchHrAccounts]);

  const handleJobAction = async (
    jobId: string,
    action: 'approve' | 'reject' | 'set-active' | 'set-inactive',
  ) => {
    const token = getStoredAdminToken();
    if (!token) return;

    setMutatingJobId(jobId);
    setErrorMessage(null);
    setStatusNotice(null);

    try {
      const apiBaseUrl = getAdminApiBaseUrl();
      const response = await fetch(`${apiBaseUrl}${getJobsEndpoint()}/${jobId}`, {
        method: 'PATCH',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action }),
      });

      const payload = (await response.json().catch(() => null)) as { message?: string } | null;
      if (!response.ok) {
        throw new Error(payload?.message ?? `Failed to apply action (${action}).`);
      }

      setStatusNotice(`Job status updated (${formatLabel(action)}).`);
      await fetchJobs();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to update job status.');
    } finally {
      setMutatingJobId(null);
    }
  };

  const handleDeleteJob = async (jobId: string, title: string) => {
    const confirmed = window.confirm(
      `Delete classified job "${title}"? This action cannot be undone.`,
    );
    if (!confirmed) return;

    const token = getStoredAdminToken();
    if (!token) return;

    setMutatingJobId(jobId);
    setErrorMessage(null);
    setStatusNotice(null);

    try {
      const apiBaseUrl = getAdminApiBaseUrl();
      const response = await fetch(`${apiBaseUrl}${getJobsEndpoint()}/${jobId}`, {
        method: 'DELETE',
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const payload = (await response.json().catch(() => null)) as { message?: string } | null;
      if (!response.ok) {
        throw new Error(payload?.message ?? 'Unable to delete job posting.');
      }

      setStatusNotice(`Deleted "${title}".`);
      await fetchJobs();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to delete job posting.');
    } finally {
      setMutatingJobId(null);
    }
  };

  const handleSelectHr = (hrId: string) => {
    setSelectedHrId(hrId);
    const matched = hrAccounts.find((item) => item._id === hrId);
    setCompanyName(matched?.companyName ?? '');
  };

  const handleCreateJobSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setDrawerError(null);

    const parsedFrom = Number(salaryFrom);
    const parsedTo = Number(salaryTo);

    if (!selectedHrId || !jobTitle.trim() || !jobDescription.trim()) {
      setDrawerError('HR account, job title, and job description are required.');
      return;
    }

    if (
      !Number.isFinite(parsedFrom) ||
      !Number.isFinite(parsedTo) ||
      parsedFrom <= 0 ||
      parsedTo < parsedFrom
    ) {
      setDrawerError('Enter a valid minimum and maximum salary range.');
      return;
    }

    const token = getStoredAdminToken();
    if (!token) return;

    setIsCreating(true);
    try {
      const apiBaseUrl = getAdminApiBaseUrl();
      const response = await fetch(`${apiBaseUrl}${getJobsEndpoint()}`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          hr: selectedHrId,
          companyName: companyName.trim(),
          jobTitle: jobTitle.trim(),
          jobType,
          workPlaceType,
          jobLocation: jobLocation.trim(),
          jobSalaryFrom: parsedFrom,
          jobSalaryTo: parsedTo,
          jobDescription: encodeUtf8Base64(jobDescription),
        }),
      });

      const payload = (await response.json().catch(() => null)) as { message?: string } | null;
      if (!response.ok) {
        throw new Error(payload?.message ?? 'Unable to create classified job post.');
      }

      setCreateDrawerOpen(false);
      setSelectedHrId('');
      setCompanyName('');
      setJobTitle('');
      setJobLocation('');
      setSalaryFrom('');
      setSalaryTo('');
      setJobDescription('');
      setStatusNotice('Classified job post created.');
      await fetchJobs();
    } catch (error) {
      setDrawerError(
        error instanceof Error ? error.message : 'Unable to create classified job post.',
      );
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="space-y-5">
      {statusNotice && (
        <div
          role="status"
          aria-live="polite"
          className="rounded-lg border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-900"
        >
          {statusNotice}
        </div>
      )}

      {errorMessage && (
        <div
          role="alert"
          aria-live="assertive"
          className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm font-medium text-red-900"
        >
          {errorMessage}
        </div>
      )}

      {/* Status Tabs & Toolbar */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div
          role="tablist"
          aria-label="Classified job status"
          className="inline-flex w-full max-w-[356px] items-center rounded-md bg-[#F8FAFC] p-1"
        >
          <button
            type="button"
            role="tab"
            id="admin-jobs-tab-approved"
            aria-selected={activeTab === 'approved'}
            aria-controls="admin-jobs-panel"
            onClick={() => setActiveTab('approved')}
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
            id="admin-jobs-tab-pending"
            aria-selected={activeTab === 'pending'}
            aria-controls="admin-jobs-panel"
            onClick={() => setActiveTab('pending')}
            className={`w-1/2 rounded-[5px] px-4 py-2 text-base font-bold transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0D3276] ${
              activeTab === 'pending'
                ? 'bg-[#E7EBF1] text-[#0D3276] shadow-sm'
                : 'text-[#595959] hover:text-[#111827]'
            }`}
          >
            Pending
          </button>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex h-11 w-full items-center gap-3 rounded-lg border border-[#D0D9E9] bg-white px-4 sm:w-72">
            <Search className="h-4 w-4 shrink-0 text-[#595959]" aria-hidden="true" />
            <label htmlFor="admin-classified-search" className="sr-only">
              Search classified jobs
            </label>
            <input
              id="admin-classified-search"
              type="search"
              placeholder="Search jobs or companies"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              className="w-full bg-transparent text-sm text-[#111827] placeholder:text-[#595959] focus:outline-none"
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => {
                  setSearchInput('');
                  setDebouncedSearch('');
                }}
                aria-label="Clear search"
                className="rounded p-1 text-[#595959] hover:text-[#111827]"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={() => {
              setDrawerError(null);
              setCreateDrawerOpen(true);
            }}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#0D3276] px-5 text-sm font-bold text-white transition-colors hover:bg-[#081F48] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0D3276]"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            <span>Create Job Post</span>
          </button>
        </div>
      </div>

      {/* Job Feed Panel */}
      <div
        id="admin-jobs-panel"
        role="tabpanel"
        aria-labelledby={
          activeTab === 'approved' ? 'admin-jobs-tab-approved' : 'admin-jobs-tab-pending'
        }
      >
        {isLoading ? (
          <div role="status" className="space-y-3">
            <div className="h-32 w-full animate-pulse rounded-xl bg-[#F1F5F9]" />
            <div className="h-32 w-full animate-pulse rounded-xl bg-[#F1F5F9]" />
            <span className="sr-only">Loading classified jobs...</span>
          </div>
        ) : jobs.length > 0 ? (
          <ul className="space-y-4">
            {jobs.map((job) => {
              const isBusy = mutatingJobId === job._id;
              const badgeStyle =
                job.status === 'active'
                  ? 'border-emerald-300 bg-emerald-50 text-emerald-900'
                  : job.status === 'inactive'
                    ? 'border-[#CBD5E1] bg-[#F1F5F9] text-[#374151]'
                    : job.status === 'rejected'
                      ? 'border-red-300 bg-red-50 text-red-900'
                      : 'border-amber-300 bg-amber-50 text-amber-900';

              return (
                <li
                  key={job._id}
                  className="rounded-2xl border border-[#E7EBF1] bg-white p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)]"
                >
                  <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
                    <div>
                      <div className="flex flex-wrap items-center gap-2.5">
                        <span
                          className={`inline-block rounded-md border px-2.5 py-0.5 text-xs font-bold ${badgeStyle}`}
                        >
                          {formatLabel(job.status)}
                        </span>
                        <span className="text-xs font-medium text-[#595959]">
                          Posted {formatDate(job.createdAt)}
                        </span>
                      </div>

                      <h2 className="mt-2 text-xl font-bold text-[#121212]">{job.jobTitle}</h2>
                      {job.companyName && (
                        <p className="mt-0.5 text-sm font-bold text-[#595959]">{job.companyName}</p>
                      )}

                      <dl className="mt-4 flex flex-wrap gap-6 md:gap-10">
                        <div>
                          <dd className="text-sm font-bold text-[#374151]">
                            {formatCurrency(job.jobSalaryFrom)} - {formatCurrency(job.jobSalaryTo)}
                          </dd>
                          <dt className="text-xs font-medium text-[#595959]">Salary Range</dt>
                        </div>

                        <div>
                          <dd className="text-sm font-bold text-[#374151]">
                            {formatLabel(job.jobType)}
                          </dd>
                          <dt className="text-xs font-medium text-[#595959]">Job Type</dt>
                        </div>

                        <div>
                          <dd className="text-sm font-bold text-[#374151]">
                            {job.workPlaceType === 'onsite' && job.jobLocation
                              ? job.jobLocation
                              : formatLabel(job.workPlaceType)}
                          </dd>
                          <dt className="text-xs font-medium text-[#595959]">Workplace</dt>
                        </div>

                        <div>
                          <dd className="flex items-center gap-1.5 text-sm font-bold text-[#0D3276]">
                            <Users className="h-4 w-4" aria-hidden="true" />
                            <span>{job.applicationNumber}</span>
                          </dd>
                          <dt className="text-xs font-medium text-[#595959]">Applicants</dt>
                        </div>
                      </dl>
                    </div>

                    {/* Moderation Controls */}
                    <div className="flex flex-wrap items-center gap-2">
                      {job.status === 'pending' && (
                        <>
                          <button
                            type="button"
                            disabled={isBusy}
                            onClick={() => void handleJobAction(job._id, 'approve')}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-[#0D3276] px-3.5 py-2 text-xs font-bold text-white hover:bg-[#081F48] disabled:opacity-60"
                          >
                            <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                            <span>Approve</span>
                          </button>

                          <button
                            type="button"
                            disabled={isBusy}
                            onClick={() => void handleJobAction(job._id, 'reject')}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-red-300 bg-red-50 px-3.5 py-2 text-xs font-bold text-red-900 hover:bg-red-100 disabled:opacity-60"
                          >
                            <XCircle className="h-4 w-4" aria-hidden="true" />
                            <span>Reject</span>
                          </button>
                        </>
                      )}

                      {job.status === 'active' && (
                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() => void handleJobAction(job._id, 'set-inactive')}
                          className="rounded-lg border border-[#595959] bg-white px-3.5 py-2 text-xs font-bold text-[#374151] hover:bg-[#F1F5F9] disabled:opacity-60"
                        >
                          Mark Inactive
                        </button>
                      )}

                      {job.status === 'inactive' && (
                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() => void handleJobAction(job._id, 'set-active')}
                          className="rounded-lg border border-[#0D3276] bg-white px-3.5 py-2 text-xs font-bold text-[#0D3276] hover:bg-[#F1F5F9] disabled:opacity-60"
                        >
                          Mark Active
                        </button>
                      )}

                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => void handleDeleteJob(job._id, job.jobTitle)}
                        aria-label={`Delete ${job.jobTitle}`}
                        className="inline-flex items-center gap-1 rounded-lg border border-red-300 px-3 py-2 text-xs font-bold text-[#B91C1C] hover:bg-red-50 disabled:opacity-60"
                      >
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="flex min-h-[260px] flex-col items-center justify-center rounded-2xl border border-dashed border-[#D0D9E9] p-8 text-center">
            <Briefcase className="h-8 w-8 text-[#595959]" aria-hidden="true" />
            <h2 className="mt-3 text-lg font-bold text-[#0D3276]">No classified jobs found</h2>
            <p className="mt-1 text-sm text-[#595959]">
              {debouncedSearch
                ? 'No postings matched your search filter.'
                : `There are currently no ${activeTab} job postings.`}
            </p>
          </div>
        )}
      </div>

      {/* Create Job Post Slide-Over Drawer */}
      {createDrawerOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="create-job-drawer-title"
          className="fixed inset-0 z-50 flex justify-end bg-black/40"
        >
          <div className="flex h-full w-full max-w-xl flex-col overflow-y-auto bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#E7EBF1] pb-4">
              <h2 id="create-job-drawer-title" className="text-xl font-bold text-[#121212]">
                Create Job Post
              </h2>
              <button
                type="button"
                onClick={() => setCreateDrawerOpen(false)}
                aria-label="Close Create Job Post drawer"
                className="rounded-lg p-2 text-[#434343] hover:bg-[#F1F5F9]"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            {drawerError && (
              <div
                role="alert"
                className="mt-4 rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm font-medium text-red-900"
              >
                {drawerError}
              </div>
            )}

            <form onSubmit={handleCreateJobSubmit} className="mt-5 flex flex-1 flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label htmlFor="admin-job-hr" className="text-sm font-semibold text-[#374151]">
                  HR Account
                </label>
                <select
                  id="admin-job-hr"
                  required
                  value={selectedHrId}
                  onChange={(event) => handleSelectHr(event.target.value)}
                  className="h-12 rounded-lg border border-[#D0D9E9] bg-white px-3 text-sm text-[#111827]"
                >
                  <option value="">Select HR account...</option>
                  {hrAccounts.map((hr) => (
                    <option key={hr._id} value={hr._id}>
                      {hr.name} ({hr.companyName || hr.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label htmlFor="admin-job-company" className="text-sm font-semibold text-[#374151]">
                  Company Name
                </label>
                <input
                  id="admin-job-company"
                  type="text"
                  readOnly
                  value={companyName}
                  placeholder="Auto-populated from selected HR account"
                  className="h-12 rounded-lg border border-[#D0D9E9] bg-[#F8FAFC] px-3 text-sm text-[#374151]"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label htmlFor="admin-job-title" className="text-sm font-semibold text-[#374151]">
                  Job Title
                </label>
                <input
                  id="admin-job-title"
                  type="text"
                  required
                  value={jobTitle}
                  onChange={(event) => setJobTitle(event.target.value)}
                  className="h-12 rounded-lg border border-[#D0D9E9] bg-white px-3 text-sm text-[#111827]"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-1">
                  <label htmlFor="admin-job-type" className="text-sm font-semibold text-[#374151]">
                    Job Type
                  </label>
                  <select
                    id="admin-job-type"
                    value={jobType}
                    onChange={(event) => setJobType(event.target.value)}
                    className="h-12 rounded-lg border border-[#D0D9E9] bg-white px-3 text-sm text-[#111827]"
                  >
                    <option value="full-time">Full Time</option>
                    <option value="part-time">Part Time</option>
                    <option value="contract">Contract</option>
                    <option value="internship">Internship</option>
                    <option value="seasonal">Seasonal</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label
                    htmlFor="admin-job-workplace"
                    className="text-sm font-semibold text-[#374151]"
                  >
                    Workplace Type
                  </label>
                  <select
                    id="admin-job-workplace"
                    value={workPlaceType}
                    onChange={(event) => setWorkPlaceType(event.target.value)}
                    className="h-12 rounded-lg border border-[#D0D9E9] bg-white px-3 text-sm text-[#111827]"
                  >
                    <option value="remote">Remote</option>
                    <option value="onsite">Onsite</option>
                    <option value="hybrid">Hybrid</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label
                  htmlFor="admin-job-location"
                  className="text-sm font-semibold text-[#374151]"
                >
                  Job Location
                </label>
                <input
                  id="admin-job-location"
                  type="text"
                  placeholder="e.g. Midland, MI or United States"
                  value={jobLocation}
                  onChange={(event) => setJobLocation(event.target.value)}
                  className="h-12 rounded-lg border border-[#D0D9E9] bg-white px-3 text-sm text-[#111827]"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-1">
                  <label
                    htmlFor="admin-job-salary-from"
                    className="text-sm font-semibold text-[#374151]"
                  >
                    Salary From (USD)
                  </label>
                  <input
                    id="admin-job-salary-from"
                    type="text"
                    inputMode="numeric"
                    required
                    value={salaryFrom}
                    onChange={(event) => setSalaryFrom(event.target.value.replace(/[^0-9]/g, ''))}
                    className="h-12 rounded-lg border border-[#D0D9E9] bg-white px-3 text-sm text-[#111827]"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label
                    htmlFor="admin-job-salary-to"
                    className="text-sm font-semibold text-[#374151]"
                  >
                    Salary To (USD)
                  </label>
                  <input
                    id="admin-job-salary-to"
                    type="text"
                    inputMode="numeric"
                    required
                    value={salaryTo}
                    onChange={(event) => setSalaryTo(event.target.value.replace(/[^0-9]/g, ''))}
                    className="h-12 rounded-lg border border-[#D0D9E9] bg-white px-3 text-sm text-[#111827]"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label
                  htmlFor="admin-job-description"
                  className="text-sm font-semibold text-[#374151]"
                >
                  Job Description
                </label>
                <textarea
                  id="admin-job-description"
                  rows={6}
                  required
                  value={jobDescription}
                  onChange={(event) => setJobDescription(event.target.value)}
                  className="rounded-lg border border-[#D0D9E9] bg-white p-3 text-sm text-[#111827]"
                />
              </div>

              <div className="mt-auto flex justify-end gap-3 border-t border-[#E7EBF1] pt-4">
                <button
                  type="button"
                  onClick={() => setCreateDrawerOpen(false)}
                  className="rounded-lg border border-[#595959] bg-white px-4 py-2.5 text-sm font-semibold text-[#374151] hover:bg-[#F1F5F9]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="rounded-lg bg-[#0D3276] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#081F48] disabled:opacity-60"
                >
                  {isCreating ? 'Publishing...' : 'Publish Job'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
