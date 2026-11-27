'use client';

import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import {
  Briefcase,
  Building2,
  Mail,
  MapPin,
  Pencil,
  Plus,
  Search,
  Trash2,
  Users,
  X,
} from 'lucide-react';
import { clearAdminSession, getAdminApiBaseUrl, getStoredAdminToken } from '@/lib/api/adminSession';
import { HR_EMPLOYMENT_COUNT_OPTIONS, HR_INDUSTRY_OPTIONS } from '@/lib/constants/hrOptions';
import { HrUserSchema, type HrUser } from '@/lib/dto/hrAuth';

interface SocialLinkDraft {
  name: string;
  link: string;
}

const getUsersEndpoint = (): string =>
  (process.env.NEXT_PUBLIC_TJAP_ADMIN_USERS_PATH ?? '/api/v1/users').trim();

export const AdminHrManagementWorkspace = () => {
  const router = useRouter();
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const [hrUsers, setHrUsers] = useState<HrUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [statusNotice, setStatusNotice] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Create / Edit Slide-Over Drawer State
  const [drawerMode, setDrawerMode] = useState<'create' | 'edit' | null>(null);
  const [editingHrId, setEditingHrId] = useState<string | null>(null);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [industry, setIndustry] = useState<string>(HR_INDUSTRY_OPTIONS[0]);
  const [employmentCount, setEmploymentCount] = useState<string>(HR_EMPLOYMENT_COUNT_OPTIONS[0]);
  const [location, setLocation] = useState('');
  const [socialLinks, setSocialLinks] = useState<SocialLinkDraft[]>([]);
  const [drawerError, setDrawerError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(searchInput.trim());
    }, 450);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    if (!drawerMode) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setDrawerMode(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [drawerMode]);

  const fetchHrDirectory = useCallback(async () => {
    const token = getStoredAdminToken();
    if (!token) return;

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const apiBaseUrl = getAdminApiBaseUrl();
      const url = new URL(`${apiBaseUrl}${getUsersEndpoint()}`, window.location.origin);
      url.searchParams.set('role', 'hr');
      url.searchParams.set('page', '1');
      url.searchParams.set('limit', '100');
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
        throw new Error(err?.message ?? 'Unable to load HR accounts.');
      }

      const envelope = payload as { data?: unknown } | null;
      const validUsers: HrUser[] = [];
      if (Array.isArray(envelope?.data)) {
        envelope.data.forEach((entry) => {
          const parsed = HrUserSchema.safeParse(entry);
          if (parsed.success) {
            validUsers.push(parsed.data);
          }
        });
      }
      setHrUsers(validUsers);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to load HR accounts.');
      setHrUsers([]);
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch, router]);

  useEffect(() => {
    void Promise.resolve().then(fetchHrDirectory);
  }, [fetchHrDirectory]);

  const openCreateDrawer = () => {
    setDrawerError(null);
    setEditingHrId(null);
    setFullName('');
    setEmail('');
    setPassword('');
    setCompanyName('');
    setIndustry(HR_INDUSTRY_OPTIONS[0]);
    setEmploymentCount(HR_EMPLOYMENT_COUNT_OPTIONS[0]);
    setLocation('');
    setSocialLinks([]);
    setDrawerMode('create');
  };

  const openEditDrawer = (hr: HrUser) => {
    setDrawerError(null);
    setEditingHrId(hr._id);
    setFullName(hr.name);
    setEmail(hr.email);
    setPassword('');
    setCompanyName(hr.companyName ?? '');
    setIndustry(hr.industry || HR_INDUSTRY_OPTIONS[0]);
    setEmploymentCount(hr.employmentCount || HR_EMPLOYMENT_COUNT_OPTIONS[0]);
    setLocation(hr.location ?? '');
    setSocialLinks((hr.socialLinks ?? []).map((item) => ({ name: item.name, link: item.link })));
    setDrawerMode('edit');
  };

  const handleAddSocialRow = () => {
    setSocialLinks((prev) => [...prev, { name: 'linkedin', link: '' }]);
  };

  const handleRemoveSocialRow = (index: number) => {
    setSocialLinks((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleUpdateSocialRow = (index: number, field: 'name' | 'link', value: string) => {
    setSocialLinks((prev) =>
      prev.map((row, idx) => (idx === index ? { ...row, [field]: value } : row)),
    );
  };

  const handleSaveHrAccount = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setDrawerError(null);

    if (!fullName.trim() || !email.trim() || !companyName.trim() || !location.trim()) {
      setDrawerError('Full name, email, company name, and location are required.');
      return;
    }

    if (drawerMode === 'create' && password.length < 8) {
      setDrawerError('Password must be at least 8 characters long.');
      return;
    }

    const token = getStoredAdminToken();
    if (!token) return;

    setIsSaving(true);
    try {
      const apiBaseUrl = getAdminApiBaseUrl();

      if (drawerMode === 'create') {
        const response = await fetch(`${apiBaseUrl}/api/v1/auth/signup`, {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: fullName.trim(),
            email: email.trim(),
            password,
            role: 'hr',
            companyName: companyName.trim(),
            industry,
            employmentCount,
            location: location.trim(),
          }),
        });

        const payload = (await response.json().catch(() => null)) as { message?: string } | null;
        if (!response.ok) {
          throw new Error(payload?.message ?? 'Unable to create HR account.');
        }

        setStatusNotice(`Created HR account for ${fullName.trim()}.`);
      } else if (drawerMode === 'edit' && editingHrId) {
        const cleanedLinks = socialLinks
          .map((item) => ({ name: item.name, link: item.link.trim() }))
          .filter((item) => item.link.length > 0);

        const response = await fetch(`${apiBaseUrl}${getUsersEndpoint()}/${editingHrId}`, {
          method: 'PUT',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: fullName.trim(),
            email: email.trim(),
            companyName: companyName.trim(),
            industry,
            employmentCount,
            location: location.trim(),
            socialLinks: cleanedLinks,
          }),
        });

        const payload = (await response.json().catch(() => null)) as { message?: string } | null;
        if (!response.ok) {
          throw new Error(payload?.message ?? 'Unable to update HR account.');
        }

        setStatusNotice(`Updated HR profile for ${fullName.trim()}.`);
      }

      setDrawerMode(null);
      await fetchHrDirectory();
    } catch (error) {
      setDrawerError(error instanceof Error ? error.message : 'Unable to save HR account.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteHr = async (hr: HrUser) => {
    const confirmed = window.confirm(
      `Delete HR account "${hr.name}" (${hr.email})? This will also remove their associated job postings and applications.`,
    );
    if (!confirmed) return;

    const token = getStoredAdminToken();
    if (!token) return;

    setDeletingId(hr._id);
    setErrorMessage(null);
    setStatusNotice(null);

    try {
      const apiBaseUrl = getAdminApiBaseUrl();
      const response = await fetch(`${apiBaseUrl}${getUsersEndpoint()}/${hr._id}`, {
        method: 'DELETE',
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const payload = (await response.json().catch(() => null)) as { message?: string } | null;
      if (!response.ok) {
        throw new Error(payload?.message ?? 'Unable to delete HR account.');
      }

      setStatusNotice(`Removed HR account ${hr.email}.`);
      await fetchHrDirectory();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to delete HR account.');
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

      {/* Search & Create Toolbar */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex h-11 w-full items-center gap-3 rounded-lg border border-[#D0D9E9] bg-white px-4 sm:max-w-sm">
          <Search className="h-4 w-4 shrink-0 text-[#595959]" aria-hidden="true" />
          <label htmlFor="admin-hr-search" className="sr-only">
            Search HR accounts
          </label>
          <input
            id="admin-hr-search"
            type="search"
            placeholder="Search by HR name, email, or company"
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
          onClick={openCreateDrawer}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#0D3276] px-5 text-sm font-bold text-white transition-colors hover:bg-[#081F48] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0D3276]"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          <span>Add HR Account</span>
        </button>
      </div>

      {/* HR Directory Cards */}
      {isLoading ? (
        <div role="status" className="space-y-3">
          <div className="h-28 w-full animate-pulse rounded-xl bg-[#F1F5F9]" />
          <div className="h-28 w-full animate-pulse rounded-xl bg-[#F1F5F9]" />
          <span className="sr-only">Loading HR directory...</span>
        </div>
      ) : hrUsers.length > 0 ? (
        <ul className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {hrUsers.map((hr) => (
            <li
              key={hr._id}
              className="flex flex-col justify-between rounded-2xl border border-[#E7EBF1] bg-white p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)]"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-bold text-[#121212]">{hr.name}</h2>
                    <p className="mt-0.5 flex items-center gap-1.5 text-sm text-[#595959]">
                      <Mail className="h-3.5 w-3.5 text-[#0D3276]" aria-hidden="true" />
                      <span>{hr.email}</span>
                    </p>
                  </div>

                  <span className="inline-flex items-center gap-1 rounded-md border border-[#D0D9E9] bg-[#F8FAFC] px-2.5 py-1 text-xs font-bold text-[#0D3276]">
                    <Briefcase className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>{hr.jobCount} Jobs</span>
                  </span>
                </div>

                <dl className="mt-4 grid grid-cols-1 gap-2 text-sm text-[#374151] sm:grid-cols-2">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 shrink-0 text-[#595959]" aria-hidden="true" />
                    <dd className="truncate font-semibold">
                      {hr.companyName || 'No company listed'}
                    </dd>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 shrink-0 text-[#595959]" aria-hidden="true" />
                    <dd className="truncate">{hr.location || 'Location not specified'}</dd>
                  </div>
                </dl>
              </div>

              <div className="mt-5 flex items-center justify-end gap-2 border-t border-[#E7EBF1] pt-4">
                <button
                  type="button"
                  onClick={() => openEditDrawer(hr)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-[#0D3276] px-3.5 py-2 text-xs font-bold text-[#0D3276] hover:bg-[#F1F5F9]"
                >
                  <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Edit</span>
                </button>

                <button
                  type="button"
                  disabled={deletingId === hr._id}
                  onClick={() => void handleDeleteHr(hr)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-red-300 px-3.5 py-2 text-xs font-bold text-[#B91C1C] hover:bg-red-50 disabled:opacity-60"
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
          <Users className="h-8 w-8 text-[#595959]" aria-hidden="true" />
          <h2 className="mt-3 text-lg font-bold text-[#0D3276]">No HR accounts found</h2>
          <p className="mt-1 text-sm text-[#595959]">
            {debouncedSearch
              ? 'No HR accounts matched your search criteria.'
              : 'No employer HR accounts are registered yet.'}
          </p>
        </div>
      )}

      {/* Create / Edit HR Slide-Over Drawer */}
      {drawerMode && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="hr-drawer-heading"
          className="fixed inset-0 z-50 flex justify-end bg-black/40"
        >
          <div className="flex h-full w-full max-w-xl flex-col overflow-y-auto bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#E7EBF1] pb-4">
              <h2 id="hr-drawer-heading" className="text-xl font-bold text-[#121212]">
                {drawerMode === 'create' ? 'Add HR Account' : 'Edit HR Account'}
              </h2>
              <button
                type="button"
                onClick={() => setDrawerMode(null)}
                aria-label="Close HR account drawer"
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

            <form onSubmit={handleSaveHrAccount} className="mt-5 flex flex-1 flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label htmlFor="hr-drawer-name" className="text-sm font-semibold text-[#374151]">
                  Full Name
                </label>
                <input
                  id="hr-drawer-name"
                  type="text"
                  required
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  className="h-12 rounded-lg border border-[#D0D9E9] bg-white px-3 text-sm text-[#111827]"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label htmlFor="hr-drawer-email" className="text-sm font-semibold text-[#374151]">
                  Work Email
                </label>
                <input
                  id="hr-drawer-email"
                  type="email"
                  required
                  disabled={drawerMode === 'edit'}
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="h-12 rounded-lg border border-[#D0D9E9] bg-white px-3 text-sm text-[#111827] disabled:bg-[#F8FAFC] disabled:text-[#595959]"
                />
              </div>

              {drawerMode === 'create' && (
                <div className="flex flex-col gap-1">
                  <label
                    htmlFor="hr-drawer-password"
                    className="text-sm font-semibold text-[#374151]"
                  >
                    Temporary Password
                  </label>
                  <input
                    id="hr-drawer-password"
                    type="password"
                    required
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="h-12 rounded-lg border border-[#D0D9E9] bg-white px-3 text-sm text-[#111827]"
                  />
                </div>
              )}

              <div className="flex flex-col gap-1">
                <label htmlFor="hr-drawer-company" className="text-sm font-semibold text-[#374151]">
                  Company Name
                </label>
                <input
                  id="hr-drawer-company"
                  type="text"
                  required
                  value={companyName}
                  onChange={(event) => setCompanyName(event.target.value)}
                  className="h-12 rounded-lg border border-[#D0D9E9] bg-white px-3 text-sm text-[#111827]"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-1">
                  <label
                    htmlFor="hr-drawer-industry"
                    className="text-sm font-semibold text-[#374151]"
                  >
                    Industry
                  </label>
                  <select
                    id="hr-drawer-industry"
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
                    htmlFor="hr-drawer-headcount"
                    className="text-sm font-semibold text-[#374151]"
                  >
                    Company Size
                  </label>
                  <select
                    id="hr-drawer-headcount"
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
              </div>

              <div className="flex flex-col gap-1">
                <label
                  htmlFor="hr-drawer-location"
                  className="text-sm font-semibold text-[#374151]"
                >
                  Location
                </label>
                <input
                  id="hr-drawer-location"
                  type="text"
                  required
                  value={location}
                  onChange={(event) => setLocation(event.target.value)}
                  className="h-12 rounded-lg border border-[#D0D9E9] bg-white px-3 text-sm text-[#111827]"
                />
              </div>

              {drawerMode === 'edit' && (
                <div className="space-y-3 border-t border-[#E7EBF1] pt-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-[#374151]">
                      Social Links (Optional)
                    </span>
                    <button
                      type="button"
                      onClick={handleAddSocialRow}
                      className="rounded-md border border-[#0D3276] px-2.5 py-1 text-xs font-bold text-[#0D3276] hover:bg-[#F1F5F9]"
                    >
                      + Add Link
                    </button>
                  </div>

                  {socialLinks.map((row, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <label htmlFor={`social-platform-${idx}`} className="sr-only">
                        Platform {idx + 1}
                      </label>
                      <select
                        id={`social-platform-${idx}`}
                        value={row.name}
                        onChange={(event) => handleUpdateSocialRow(idx, 'name', event.target.value)}
                        className="h-11 rounded-lg border border-[#D0D9E9] bg-white px-2.5 text-xs font-semibold text-[#111827]"
                      >
                        <option value="linkedin">LinkedIn</option>
                        <option value="instagram">Instagram</option>
                        <option value="facebook">Facebook</option>
                        <option value="general">Website</option>
                      </select>

                      <label htmlFor={`social-url-${idx}`} className="sr-only">
                        URL {idx + 1}
                      </label>
                      <input
                        id={`social-url-${idx}`}
                        type="url"
                        placeholder="https://..."
                        value={row.link}
                        onChange={(event) => handleUpdateSocialRow(idx, 'link', event.target.value)}
                        className="h-11 flex-1 rounded-lg border border-[#D0D9E9] bg-white px-3 text-xs text-[#111827]"
                      />

                      <button
                        type="button"
                        onClick={() => handleRemoveSocialRow(idx)}
                        aria-label={`Remove social link ${idx + 1}`}
                        className="rounded-lg p-2 text-[#B91C1C] hover:bg-red-50"
                      >
                        <X className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-auto flex justify-end gap-3 border-t border-[#E7EBF1] pt-4">
                <button
                  type="button"
                  onClick={() => setDrawerMode(null)}
                  className="rounded-lg border border-[#595959] bg-white px-4 py-2.5 text-sm font-semibold text-[#374151] hover:bg-[#F1F5F9]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="rounded-lg bg-[#0D3276] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#081F48] disabled:opacity-60"
                >
                  {isSaving ? 'Saving...' : 'Save HR Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
