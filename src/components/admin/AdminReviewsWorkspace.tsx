'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Building2,
  CheckCircle2,
  MessageSquareText,
  Search,
  Star,
  Trash2,
  X,
  XCircle,
} from 'lucide-react';
import { clearAdminSession, getAdminApiBaseUrl, getStoredAdminToken } from '@/lib/api/adminSession';
import {
  ReviewModerationActionSchema,
  ReviewsListResponseSchema,
  type ApplicantReview,
} from '@/lib/dto/adminPortal';

const formatDate = (isoDate: string): string => {
  if (!isoDate) return 'Not specified';
  const parsed = new Date(isoDate);
  if (Number.isNaN(parsed.getTime())) return isoDate;
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(parsed);
};

const formatLabel = (raw: string): string =>
  raw.replace(/[-_]/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());

const getCompanyDisplayName = (company: ApplicantReview['company']): string => {
  if (typeof company === 'string') return company;
  return company.companyName ?? 'Unknown Company';
};

export const AdminReviewsWorkspace = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'approved' | 'pending'>('approved');
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const [reviews, setReviews] = useState<ApplicantReview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [statusNotice, setStatusNotice] = useState<string | null>(null);

  const [selectedReview, setSelectedReview] = useState<ApplicantReview | null>(null);
  const [isMutating, setIsMutating] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(searchInput.trim());
    }, 450);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    if (!selectedReview) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setSelectedReview(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedReview]);

  const fetchReviews = useCallback(async () => {
    const token = getStoredAdminToken();
    if (!token) return;

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const apiBaseUrl = getAdminApiBaseUrl();
      const url = new URL(`${apiBaseUrl}/api/v1/reviews`, window.location.origin);
      url.searchParams.set('page', '1');
      url.searchParams.set('limit', '50');

      const statuses =
        activeTab === 'approved' ? ['active', 'inactive'] : ['pending', 'pending_new_company'];
      statuses.forEach((st) => url.searchParams.append('status', st));

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

      const rawPayload: unknown = await response.json().catch(() => null);
      if (!response.ok) {
        const err = rawPayload as { message?: string } | null;
        throw new Error(err?.message ?? 'Unable to load applicant reviews.');
      }

      const parsed = ReviewsListResponseSchema.safeParse(rawPayload);
      if (!parsed.success) {
        throw new Error('Unexpected reviews payload format received from server.');
      }

      setReviews(parsed.data.data);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to load applicant reviews.');
      setReviews([]);
    } finally {
      setIsLoading(false);
    }
  }, [activeTab, debouncedSearch, router]);

  useEffect(() => {
    void Promise.resolve().then(fetchReviews);
  }, [fetchReviews]);

  const handleModerationAction = async (
    reviewId: string,
    action: 'approve' | 'reject' | 'set-active' | 'set-inactive',
  ) => {
    const validated = ReviewModerationActionSchema.safeParse({ action });
    if (!validated.success) return;

    const token = getStoredAdminToken();
    if (!token) return;

    setIsMutating(true);
    setErrorMessage(null);
    setStatusNotice(null);

    try {
      const apiBaseUrl = getAdminApiBaseUrl();
      const response = await fetch(`${apiBaseUrl}/api/v1/reviews/${reviewId}`, {
        method: 'PATCH',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(validated.data),
      });

      const payload = (await response.json().catch(() => null)) as { message?: string } | null;
      if (!response.ok) {
        throw new Error(payload?.message ?? `Failed to apply review action (${action}).`);
      }

      setStatusNotice(`Review updated (${formatLabel(action)}).`);
      setSelectedReview(null);
      await fetchReviews();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to update review.');
    } finally {
      setIsMutating(false);
    }
  };

  const handleDeleteReview = async (reviewId: string, reviewTitle: string) => {
    const confirmed = window.confirm(
      `Delete applicant review "${reviewTitle}"? This action cannot be undone.`,
    );
    if (!confirmed) return;

    const token = getStoredAdminToken();
    if (!token) return;

    setIsMutating(true);
    setErrorMessage(null);
    setStatusNotice(null);

    try {
      const apiBaseUrl = getAdminApiBaseUrl();
      const response = await fetch(`${apiBaseUrl}/api/v1/reviews/${reviewId}`, {
        method: 'DELETE',
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const payload = (await response.json().catch(() => null)) as { message?: string } | null;
      if (!response.ok) {
        throw new Error(payload?.message ?? 'Unable to delete review.');
      }

      setStatusNotice(`Deleted review "${reviewTitle}".`);
      setSelectedReview(null);
      await fetchReviews();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to delete review.');
    } finally {
      setIsMutating(false);
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
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
        <div
          role="tablist"
          aria-label="Applicant review moderation status"
          className="inline-flex w-full max-w-[356px] items-center rounded-md bg-[#F8FAFC] p-1"
        >
          <button
            type="button"
            role="tab"
            id="admin-reviews-tab-approved"
            aria-selected={activeTab === 'approved'}
            aria-controls="admin-reviews-panel"
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
            id="admin-reviews-tab-pending"
            aria-selected={activeTab === 'pending'}
            aria-controls="admin-reviews-panel"
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
            <label htmlFor="admin-reviews-search" className="sr-only">
              Search applicant reviews
            </label>
            <input
              id="admin-reviews-search"
              type="search"
              placeholder="Search title, role, or platform"
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

          <Link
            href="/reviews/reviewed-companies"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-[#0D3276] bg-white px-4 text-sm font-bold text-[#0D3276] transition-colors hover:bg-[#F1F5F9] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0D3276]"
          >
            <Building2 className="h-4 w-4" aria-hidden="true" />
            <span>Reviewed Companies</span>
          </Link>
        </div>
      </div>

      {/* Reviews List Panel */}
      <div
        id="admin-reviews-panel"
        role="tabpanel"
        aria-labelledby={
          activeTab === 'approved' ? 'admin-reviews-tab-approved' : 'admin-reviews-tab-pending'
        }
      >
        {isLoading ? (
          <div role="status" className="space-y-3">
            <div className="h-32 w-full animate-pulse rounded-xl bg-[#F1F5F9]" />
            <div className="h-32 w-full animate-pulse rounded-xl bg-[#F1F5F9]" />
            <span className="sr-only">Loading applicant reviews...</span>
          </div>
        ) : reviews.length > 0 ? (
          <ul className="space-y-4">
            {reviews.map((review) => {
              const companyLabel = getCompanyDisplayName(review.company);
              const badgeStyle =
                review.status === 'active'
                  ? 'border-emerald-300 bg-emerald-50 text-emerald-900'
                  : review.status === 'inactive'
                    ? 'border-[#CBD5E1] bg-[#F1F5F9] text-[#374151]'
                    : 'border-amber-300 bg-amber-50 text-amber-900';

              return (
                <li key={review._id}>
                  <button
                    type="button"
                    onClick={() => setSelectedReview(review)}
                    className="flex w-full flex-col gap-3 rounded-2xl border border-[#E7EBF1] bg-white p-6 text-left shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition-colors hover:border-[#0D3276] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0D3276]"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <span
                          className={`inline-block rounded-md border px-2.5 py-0.5 text-xs font-bold ${badgeStyle}`}
                        >
                          {formatLabel(review.status)}
                        </span>
                        <span className="text-sm font-bold text-[#0D3276]">{companyLabel}</span>
                      </div>

                      <div
                        aria-label={`${review.rating} out of 5 stars`}
                        className="flex items-center gap-1 text-[#0D3276]"
                      >
                        {[1, 2, 3, 4, 5].map((starIndex) => (
                          <Star
                            key={starIndex}
                            className={`h-4 w-4 ${
                              starIndex <= review.rating
                                ? 'fill-[#0D3276] text-[#0D3276]'
                                : 'text-[#CBD5E1]'
                            }`}
                            aria-hidden="true"
                          />
                        ))}
                      </div>
                    </div>

                    <div>
                      <h2 className="text-lg font-bold text-[#121212]">{review.title}</h2>
                      <p className="mt-0.5 text-sm font-semibold text-[#595959]">
                        {review.jobTitle} · {review.hiringPlatform}
                      </p>
                    </div>

                    {review.description && (
                      <p className="line-clamp-2 text-sm text-[#374151]">{review.description}</p>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="flex min-h-[260px] flex-col items-center justify-center rounded-2xl border border-dashed border-[#D0D9E9] p-8 text-center">
            <MessageSquareText className="h-8 w-8 text-[#595959]" aria-hidden="true" />
            <h2 className="mt-3 text-lg font-bold text-[#0D3276]">No results found</h2>
            <p className="mt-1 text-sm text-[#595959]">
              {debouncedSearch
                ? 'No applicant reviews matched your current search query.'
                : `There are currently no ${activeTab} reviews to display.`}
            </p>
          </div>
        )}
      </div>

      {/* Review Detail Slide-Over Drawer */}
      {selectedReview && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="review-drawer-title"
          className="fixed inset-0 z-50 flex justify-end bg-black/40"
        >
          <div className="flex h-full w-full max-w-xl flex-col overflow-y-auto bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#E7EBF1] pb-4">
              <div>
                <span className="inline-block rounded-md border border-[#D0D9E9] bg-[#F8FAFC] px-2.5 py-0.5 text-xs font-bold text-[#0D3276]">
                  {formatLabel(selectedReview.status)}
                </span>
                <h2 id="review-drawer-title" className="mt-2 text-xl font-bold text-[#121212]">
                  {selectedReview.title}
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setSelectedReview(null)}
                aria-label="Close review details drawer"
                className="rounded-lg p-2 text-[#434343] hover:bg-[#F1F5F9]"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <div>
                <p className="text-base font-bold text-[#0D3276]">
                  {getCompanyDisplayName(selectedReview.company)}
                </p>
                <p className="text-sm font-medium text-[#595959]">{selectedReview.jobTitle}</p>
              </div>

              <div
                aria-label={`${selectedReview.rating} out of 5 stars`}
                className="flex items-center gap-1"
              >
                {[1, 2, 3, 4, 5].map((starIndex) => (
                  <Star
                    key={starIndex}
                    className={`h-5 w-5 ${
                      starIndex <= selectedReview.rating
                        ? 'fill-[#0D3276] text-[#0D3276]'
                        : 'text-[#CBD5E1]'
                    }`}
                    aria-hidden="true"
                  />
                ))}
              </div>
            </div>

            {/* 2x2 Metadata Grid */}
            <dl className="mt-5 grid grid-cols-2 gap-4 rounded-xl border border-[#E7EBF1] bg-[#F8FAFC] p-4">
              <div>
                <dt className="text-xs font-semibold text-[#595959]">Response Duration</dt>
                <dd className="mt-1 text-sm font-bold text-[#111827]">
                  {selectedReview.noOfDays} {selectedReview.noOfDays === 1 ? 'day' : 'days'}
                </dd>
              </div>

              <div>
                <dt className="text-xs font-semibold text-[#595959]">Interviews</dt>
                <dd className="mt-1 text-sm font-bold text-[#111827]">
                  {selectedReview.noOfInterviews}
                </dd>
              </div>

              <div>
                <dt className="text-xs font-semibold text-[#595959]">Application Date</dt>
                <dd className="mt-1 text-sm font-bold text-[#111827]">
                  {formatDate(selectedReview.applicationDate)}
                </dd>
              </div>

              <div>
                <dt className="text-xs font-semibold text-[#595959]">Hiring Platform</dt>
                <dd className="mt-1 text-sm font-bold text-[#111827]">
                  {selectedReview.otherHiringPlatform || selectedReview.hiringPlatform}
                </dd>
              </div>
            </dl>

            {/* Review Body */}
            <div className="mt-5 flex-1">
              <h3 className="text-sm font-bold text-[#374151]">Applicant Experience</h3>
              <p className="mt-2 rounded-xl border border-[#E7EBF1] bg-white p-4 text-sm leading-relaxed whitespace-pre-line text-[#111827]">
                {selectedReview.description || 'No narrative commentary provided.'}
              </p>
            </div>

            {/* Sticky Footer Actions */}
            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-[#E7EBF1] pt-4">
              <button
                type="button"
                disabled={isMutating}
                onClick={() => void handleDeleteReview(selectedReview._id, selectedReview.title)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-red-300 px-3.5 py-2.5 text-xs font-bold text-[#B91C1C] hover:bg-red-50 disabled:opacity-60"
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
                <span>Delete</span>
              </button>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedReview(null)}
                  className="rounded-lg border border-[#595959] bg-white px-4 py-2.5 text-sm font-semibold text-[#374151] hover:bg-[#F1F5F9]"
                >
                  Cancel
                </button>

                {(selectedReview.status === 'pending' ||
                  selectedReview.status === 'pending_new_company') && (
                  <>
                    <button
                      type="button"
                      disabled={isMutating}
                      onClick={() => void handleModerationAction(selectedReview._id, 'reject')}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-red-300 bg-red-50 px-4 py-2.5 text-sm font-bold text-red-900 hover:bg-red-100 disabled:opacity-60"
                    >
                      <XCircle className="h-4 w-4" aria-hidden="true" />
                      <span>Reject</span>
                    </button>

                    <button
                      type="button"
                      disabled={isMutating}
                      onClick={() => void handleModerationAction(selectedReview._id, 'approve')}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-[#0D3276] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#081F48] disabled:opacity-60"
                    >
                      <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                      <span>Approve</span>
                    </button>
                  </>
                )}

                {selectedReview.status === 'active' && (
                  <button
                    type="button"
                    disabled={isMutating}
                    onClick={() => void handleModerationAction(selectedReview._id, 'set-inactive')}
                    className="rounded-lg bg-[#0D3276] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#081F48] disabled:opacity-60"
                  >
                    Mark as Inactive
                  </button>
                )}

                {selectedReview.status === 'inactive' && (
                  <button
                    type="button"
                    disabled={isMutating}
                    onClick={() => void handleModerationAction(selectedReview._id, 'set-active')}
                    className="rounded-lg bg-[#0D3276] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#081F48] disabled:opacity-60"
                  >
                    Mark as Active
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
