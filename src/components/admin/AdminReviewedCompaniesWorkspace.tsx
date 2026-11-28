'use client';

import { useCallback, useEffect, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  ArrowRightLeft,
  Building2,
  MapPin,
  Pencil,
  Search,
  Star,
  Trash2,
  Users,
  X,
} from 'lucide-react';
import { clearAdminSession, getAdminApiBaseUrl, getStoredAdminToken } from '@/lib/api/adminSession';
import { HR_EMPLOYMENT_COUNT_OPTIONS, HR_INDUSTRY_OPTIONS } from '@/lib/constants/hrOptions';
import {
  ReviewCompaniesListResponseSchema,
  TransferCompanyReviewsPayloadSchema,
  UpdateCompanyPayloadSchema,
  type ReviewCompany,
} from '@/lib/dto/adminPortal';

export const AdminReviewedCompaniesWorkspace = () => {
  const router = useRouter();
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const [companies, setCompanies] = useState<ReviewCompany[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [statusNotice, setStatusNotice] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Modify Company Details Slide-Over Drawer
  const [editingCompany, setEditingCompany] = useState<ReviewCompany | null>(null);
  const [companyName, setCompanyName] = useState('');
  const [industry, setIndustry] = useState<string>(HR_INDUSTRY_OPTIONS[0]);
  const [employmentCount, setEmploymentCount] = useState<string>(HR_EMPLOYMENT_COUNT_OPTIONS[0]);
  const [location, setLocation] = useState('');
  const [drawerError, setDrawerError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Transfer Reviews Modal
  const [transferSourceCompany, setTransferSourceCompany] = useState<ReviewCompany | null>(null);
  const [transferTargetId, setTransferTargetId] = useState('');
  const [transferError, setTransferError] = useState<string | null>(null);
  const [isTransferring, setIsTransferring] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(searchInput.trim());
    }, 450);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    if (!editingCompany && !transferSourceCompany) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (transferSourceCompany) {
          setTransferSourceCompany(null);
        } else {
          setEditingCompany(null);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [editingCompany, transferSourceCompany]);

  const fetchCompanies = useCallback(async () => {
    const token = getStoredAdminToken();
    if (!token) return;

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const apiBaseUrl = getAdminApiBaseUrl();
      const url = new URL(`${apiBaseUrl}/api/v1/companies`, window.location.origin);
      url.searchParams.set('page', '1');
      url.searchParams.set('limit', '100');
      if (debouncedSearch) {
        url.searchParams.set('search', debouncedSearch);
        url.searchParams.set('searchType', 'company');
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
        throw new Error(err?.message ?? 'Unable to load reviewed companies.');
      }

      const parsed = ReviewCompaniesListResponseSchema.safeParse(rawPayload);
      if (!parsed.success) {
        throw new Error('Unexpected reviewed companies payload format received from server.');
      }

      setCompanies(parsed.data.data);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Unable to load reviewed companies.',
      );
      setCompanies([]);
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch, router]);

  useEffect(() => {
    void Promise.resolve().then(fetchCompanies);
  }, [fetchCompanies]);

  const openModifyDrawer = (company: ReviewCompany) => {
    setDrawerError(null);
    setEditingCompany(company);
    setCompanyName(company.companyName);
    setIndustry(company.industry || HR_INDUSTRY_OPTIONS[0]);
    setEmploymentCount(company.employmentCount || HR_EMPLOYMENT_COUNT_OPTIONS[0]);
    setLocation(company.location ?? '');
  };

  const handleSaveCompany = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editingCompany) return;
    setDrawerError(null);

    const validated = UpdateCompanyPayloadSchema.safeParse({
      companyName,
      industry,
      employmentCount,
      location: location.trim(),
    });

    if (!validated.success) {
      setDrawerError(validated.error.issues[0]?.message ?? 'Please check company details.');
      return;
    }

    const token = getStoredAdminToken();
    if (!token) return;

    setIsUpdating(true);
    try {
      const apiBaseUrl = getAdminApiBaseUrl();
      const response = await fetch(`${apiBaseUrl}/api/v1/companies/${editingCompany._id}`, {
        method: 'PUT',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(validated.data),
      });

      const payload = (await response.json().catch(() => null)) as { message?: string } | null;
      if (!response.ok) {
        throw new Error(payload?.message ?? 'Unable to update company details.');
      }

      setStatusNotice(`Updated "${validated.data.companyName}".`);
      setEditingCompany(null);
      await fetchCompanies();
    } catch (error) {
      setDrawerError(error instanceof Error ? error.message : 'Unable to update company details.');
    } finally {
      setIsUpdating(false);
    }
  };

  const openTransferModal = (sourceCompany: ReviewCompany) => {
    setTransferError(null);
    setTransferTargetId('');
    setTransferSourceCompany(sourceCompany);
  };

  const handleTransferReviews = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!transferSourceCompany) return;
    setTransferError(null);

    const validated = TransferCompanyReviewsPayloadSchema.safeParse({
      action: 'transfer',
      data: {
        transferCompanyId: transferTargetId,
      },
    });

    if (!validated.success) {
      setTransferError(validated.error.issues[0]?.message ?? 'Select a destination company.');
      return;
    }

    const token = getStoredAdminToken();
    if (!token) return;

    setIsTransferring(true);
    try {
      const apiBaseUrl = getAdminApiBaseUrl();
      const response = await fetch(`${apiBaseUrl}/api/v1/companies/${transferSourceCompany._id}`, {
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
        throw new Error(payload?.message ?? 'Unable to transfer reviews.');
      }

      setStatusNotice(`Transferred reviews from "${transferSourceCompany.companyName}".`);
      setTransferSourceCompany(null);
      setEditingCompany(null);
      await fetchCompanies();
    } catch (error) {
      setTransferError(error instanceof Error ? error.message : 'Unable to transfer reviews.');
    } finally {
      setIsTransferring(false);
    }
  };

  const handleDeleteCompany = async (company: ReviewCompany) => {
    if (company.reviewCount > 0) {
      setErrorMessage(
        `Cannot delete "${company.companyName}" while it has ${company.reviewCount} active review(s). Transfer reviews first.`,
      );
      return;
    }

    const confirmed = window.confirm(
      `Delete company "${company.companyName}"? This action cannot be undone.`,
    );
    if (!confirmed) return;

    const token = getStoredAdminToken();
    if (!token) return;

    setDeletingId(company._id);
    setErrorMessage(null);
    setStatusNotice(null);

    try {
      const apiBaseUrl = getAdminApiBaseUrl();
      const response = await fetch(`${apiBaseUrl}/api/v1/companies/${company._id}`, {
        method: 'DELETE',
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const payload = (await response.json().catch(() => null)) as { message?: string } | null;
      if (!response.ok) {
        throw new Error(payload?.message ?? 'Unable to delete company.');
      }

      setStatusNotice(`Deleted "${company.companyName}".`);
      await fetchCompanies();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to delete company.');
    } finally {
      setDeletingId(null);
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

      {/* Top Navigation & Search Toolbar */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <Link
          href="/reviews"
          className="inline-flex items-center gap-2 text-sm font-bold text-[#0D3276] hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0D3276]"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          <span>Back to Reviews</span>
        </Link>

        <div className="flex h-11 w-full items-center gap-3 rounded-lg border border-[#D0D9E9] bg-white px-4 sm:max-w-sm">
          <Search className="h-4 w-4 shrink-0 text-[#595959]" aria-hidden="true" />
          <label htmlFor="admin-companies-search" className="sr-only">
            Search reviewed companies
          </label>
          <input
            id="admin-companies-search"
            type="search"
            placeholder="Search company name"
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
      </div>

      {/* Companies Directory Grid */}
      {isLoading ? (
        <div role="status" className="space-y-3">
          <div className="h-28 w-full animate-pulse rounded-xl bg-[#F1F5F9]" />
          <div className="h-28 w-full animate-pulse rounded-xl bg-[#F1F5F9]" />
          <span className="sr-only">Loading reviewed companies...</span>
        </div>
      ) : companies.length > 0 ? (
        <ul className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {companies.map((company) => (
            <li
              key={company._id}
              className="flex flex-col justify-between rounded-2xl border border-[#E7EBF1] bg-white p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)]"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-bold text-[#121212]">{company.companyName}</h2>
                    <p className="mt-0.5 text-xs font-semibold text-[#595959]">
                      {company.industry || 'Industry not specified'}
                    </p>
                  </div>

                  <div className="flex items-center gap-1 rounded-md border border-[#D0D9E9] bg-[#F8FAFC] px-2.5 py-1 text-xs font-bold text-[#0D3276]">
                    <Star
                      className="h-3.5 w-3.5 fill-[#0D3276] text-[#0D3276]"
                      aria-hidden="true"
                    />
                    <span>{company.avgRating.toFixed(1)}</span>
                    <span className="text-[#595959]">({company.reviewCount})</span>
                  </div>
                </div>

                <dl className="mt-4 grid grid-cols-1 gap-2 text-sm text-[#374151] sm:grid-cols-2">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 shrink-0 text-[#595959]" aria-hidden="true" />
                    <dd>{company.employmentCount || 'Size unlisted'}</dd>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 shrink-0 text-[#595959]" aria-hidden="true" />
                    <dd className="truncate">{company.location || 'Location unlisted'}</dd>
                  </div>
                </dl>
              </div>

              <div className="mt-5 flex flex-wrap items-center justify-end gap-2 border-t border-[#E7EBF1] pt-4">
                <button
                  type="button"
                  onClick={() => openTransferModal(company)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-[#595959] px-3 py-2 text-xs font-bold text-[#374151] hover:bg-[#F1F5F9]"
                >
                  <ArrowRightLeft className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Transfer Reviews</span>
                </button>

                <button
                  type="button"
                  onClick={() => openModifyDrawer(company)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-[#0D3276] px-3 py-2 text-xs font-bold text-[#0D3276] hover:bg-[#F1F5F9]"
                >
                  <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Modify</span>
                </button>

                <button
                  type="button"
                  disabled={deletingId === company._id || company.reviewCount > 0}
                  title={
                    company.reviewCount > 0
                      ? 'Transfer reviews before deleting this company'
                      : 'Delete company'
                  }
                  onClick={() => void handleDeleteCompany(company)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-red-300 px-3 py-2 text-xs font-bold text-[#B91C1C] hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-45"
                >
                  <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Delete</span>
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="flex min-h-[260px] flex-col items-center justify-center rounded-2xl border border-dashed border-[#D0D9E9] p-8 text-center">
          <Building2 className="h-8 w-8 text-[#595959]" aria-hidden="true" />
          <h2 className="mt-3 text-lg font-bold text-[#0D3276]">No reviewed companies found</h2>
          <p className="mt-1 text-sm text-[#595959]">
            {debouncedSearch
              ? 'No companies matched your search query.'
              : 'There are currently no reviewed companies in the directory.'}
          </p>
        </div>
      )}

      {/* Modify Company Details Slide-Over Drawer */}
      {editingCompany && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modify-company-drawer-title"
          className="fixed inset-0 z-50 flex justify-end bg-black/40"
        >
          <div className="flex h-full w-full max-w-xl flex-col overflow-y-auto bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#E7EBF1] pb-4">
              <h2 id="modify-company-drawer-title" className="text-xl font-bold text-[#121212]">
                Modify Company Details
              </h2>
              <button
                type="button"
                onClick={() => setEditingCompany(null)}
                aria-label="Close Modify Company drawer"
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

            <form onSubmit={handleSaveCompany} className="mt-5 flex flex-1 flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label
                  htmlFor="modify-company-name"
                  className="text-sm font-semibold text-[#374151]"
                >
                  Company Name
                </label>
                <input
                  id="modify-company-name"
                  type="text"
                  required
                  value={companyName}
                  onChange={(event) => setCompanyName(event.target.value)}
                  className="h-12 rounded-lg border border-[#D0D9E9] bg-white px-3 text-sm text-[#111827]"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label
                  htmlFor="modify-company-industry"
                  className="text-sm font-semibold text-[#374151]"
                >
                  Industry
                </label>
                <select
                  id="modify-company-industry"
                  value={industry}
                  onChange={(event) => setIndustry(event.target.value)}
                  className="h-12 rounded-lg border border-[#D0D9E9] bg-white px-3 text-sm text-[#111827]"
                >
                  {HR_INDUSTRY_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label
                  htmlFor="modify-company-size"
                  className="text-sm font-semibold text-[#374151]"
                >
                  Company Size
                </label>
                <select
                  id="modify-company-size"
                  value={employmentCount}
                  onChange={(event) => setEmploymentCount(event.target.value)}
                  className="h-12 rounded-lg border border-[#D0D9E9] bg-white px-3 text-sm text-[#111827]"
                >
                  {HR_EMPLOYMENT_COUNT_OPTIONS.map((tier) => (
                    <option key={tier} value={tier}>
                      {tier} employees
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label
                  htmlFor="modify-company-location"
                  className="text-sm font-semibold text-[#374151]"
                >
                  Location
                </label>
                <input
                  id="modify-company-location"
                  type="text"
                  value={location}
                  onChange={(event) => setLocation(event.target.value)}
                  className="h-12 rounded-lg border border-[#D0D9E9] bg-white px-3 text-sm text-[#111827]"
                />
              </div>

              <div className="mt-2 rounded-xl border border-[#E7EBF1] bg-[#F8FAFC] p-4">
                <p className="text-xs font-semibold text-[#595959]">
                  Consolidating duplicate company entries?
                </p>
                <button
                  type="button"
                  onClick={() => openTransferModal(editingCompany)}
                  className="mt-2 inline-flex items-center gap-1.5 text-sm font-bold text-[#0D3276] hover:underline"
                >
                  <ArrowRightLeft className="h-4 w-4" aria-hidden="true" />
                  <span>Transfer reviews to another company</span>
                </button>
              </div>

              <div className="mt-auto flex justify-end gap-3 border-t border-[#E7EBF1] pt-4">
                <button
                  type="button"
                  onClick={() => setEditingCompany(null)}
                  className="rounded-lg border border-[#595959] bg-white px-4 py-2.5 text-sm font-semibold text-[#374151] hover:bg-[#F1F5F9]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="rounded-lg bg-[#0D3276] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#081F48] disabled:opacity-60"
                >
                  {isUpdating ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Transfer Reviews Modal */}
      {transferSourceCompany && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="transfer-reviews-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        >
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#E7EBF1] pb-3">
              <h2 id="transfer-reviews-modal-title" className="text-lg font-bold text-[#121212]">
                Transfer Reviews
              </h2>
              <button
                type="button"
                onClick={() => setTransferSourceCompany(null)}
                aria-label="Close Transfer Reviews modal"
                className="rounded-lg p-1.5 text-[#434343] hover:bg-[#F1F5F9]"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            {transferError && (
              <div
                role="alert"
                className="mt-4 rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm font-medium text-red-900"
              >
                {transferError}
              </div>
            )}

            <form onSubmit={handleTransferReviews} className="mt-4 space-y-4">
              <div className="flex flex-col gap-1">
                <label
                  htmlFor="transfer-from-company"
                  className="text-sm font-semibold text-[#374151]"
                >
                  From
                </label>
                <input
                  id="transfer-from-company"
                  type="text"
                  disabled
                  value={`${transferSourceCompany.companyName} (${transferSourceCompany.reviewCount} reviews)`}
                  className="h-12 rounded-lg border border-[#D0D9E9] bg-[#F8FAFC] px-3 text-sm text-[#595959]"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label
                  htmlFor="transfer-to-company"
                  className="text-sm font-semibold text-[#374151]"
                >
                  To
                </label>
                <select
                  id="transfer-to-company"
                  required
                  value={transferTargetId}
                  onChange={(event) => setTransferTargetId(event.target.value)}
                  className="h-12 rounded-lg border border-[#D0D9E9] bg-white px-3 text-sm text-[#111827]"
                >
                  <option value="">Select destination company...</option>
                  {companies
                    .filter((item) => item._id !== transferSourceCompany._id)
                    .map((item) => (
                      <option key={item._id} value={item._id}>
                        {item.companyName}
                      </option>
                    ))}
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setTransferSourceCompany(null)}
                  className="rounded-lg border border-[#595959] bg-white px-4 py-2.5 text-sm font-semibold text-[#374151] hover:bg-[#F1F5F9]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isTransferring}
                  className="rounded-lg bg-[#0D3276] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#081F48] disabled:opacity-60"
                >
                  {isTransferring ? 'Transferring...' : 'Transfer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
