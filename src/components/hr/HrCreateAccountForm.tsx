'use client';

import { useState, type FormEvent } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Check, ChevronDown, Circle, Eye, EyeOff, Minus } from 'lucide-react';
import { HR_EMPLOYMENT_COUNT_OPTIONS, HR_INDUSTRY_OPTIONS } from '@/lib/constants/hrOptions';
import { HrCreateAccountStepOneSchema, HrLoginResponseSchema } from '@/lib/dto/hrAuth';
import { HR_TOKEN_STORAGE_KEY, HR_USER_STORAGE_KEY } from '@/lib/api/hrSession';

type SocialPlatform = '' | 'facebook' | 'instagram' | 'linkedin' | 'general';

interface SocialLinkRow {
  id: string;
  name: SocialPlatform;
  link: string;
}

interface HrCreateAccountFormProps {
  logoSrc?: string;
}

const SOCIAL_PLATFORM_OPTIONS: ReadonlyArray<{
  value: Exclude<SocialPlatform, ''>;
  label: string;
}> = [
  { value: 'facebook', label: 'Facebook' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'general', label: 'Website' },
];

const PLATFORM_URL_PATTERNS: Record<Exclude<SocialPlatform, '' | 'general'>, RegExp> = {
  linkedin: /^(https?:\/\/)?(www\.)?linkedin\.com(\/.*)?$/i,
  instagram: /^(https?:\/\/)?(www\.)?instagram\.com(\/.*)?$/i,
  facebook: /^(https?:\/\/)?(www\.)?facebook\.com(\/.*)?$/i,
};

const PASSWORD_COMPLEXITY_REGEX = /^(?=.*[0-9])(?=.*[#?!@$%^&*-])(?=.*[A-Z]).{8,}$/;

const createEmptySocialRow = (seed: number): SocialLinkRow => ({
  id: `social-row-${seed}`,
  name: '',
  link: '',
});

const isValidHttpUrl = (value: string): boolean => {
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
};

const isValidPlatformUrl = (platform: Exclude<SocialPlatform, ''>, value: string): boolean => {
  if (!isValidHttpUrl(value)) return false;
  if (platform === 'general') return true;
  return PLATFORM_URL_PATTERNS[platform].test(value);
};

const extractUserId = (rawPayload: unknown): string | null => {
  if (!rawPayload || typeof rawPayload !== 'object') return null;
  const root = rawPayload as Record<string, unknown>;
  const dataObj =
    root.data && typeof root.data === 'object' ? (root.data as Record<string, unknown>) : root;
  const userObj =
    dataObj.user && typeof dataObj.user === 'object'
      ? (dataObj.user as Record<string, unknown>)
      : dataObj;

  const candidateId = userObj._id ?? userObj.id;
  return typeof candidateId === 'string' && candidateId.trim().length > 0 ? candidateId : null;
};

export const HrCreateAccountForm = ({ logoSrc = '/logosm.svg' }: HrCreateAccountFormProps) => {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [industry, setIndustry] = useState('');
  const [employmentCount, setEmploymentCount] = useState('');
  const [location, setLocation] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [hrUserId, setHrUserId] = useState<string | null>(null);
  const [hasSessionToken, setHasSessionToken] = useState(false);
  const [socialLinks, setSocialLinks] = useState<SocialLinkRow[]>(() => [createEmptySocialRow(0)]);
  const [nextRowSeed, setNextRowSeed] = useState(1);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const passwordChecks = {
    length: password.length >= 8,
    hasNumber: /[0-9]/.test(password),
    hasSymbol: /[#?!@$%^&*-]/.test(password),
    hasUppercase: /[A-Z]/.test(password),
  };

  const handleNextStep = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);

    const validation = HrCreateAccountStepOneSchema.safeParse({
      name,
      email,
      companyName,
      industry,
      employmentCount,
      location,
    });

    if (!validation.success) {
      setErrorMessage(
        validation.error.issues[0]?.message ?? 'Please complete all required organization details.',
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const apiBaseUrl =
        process.env.NEXT_PUBLIC_TJAP_API_URL ?? 'https://api.thejobapplicantperspective.com';
      const checkEmailPath =
        process.env.NEXT_PUBLIC_TJAP_HR_CHECK_EMAIL_PATH ?? '/api/v1/auth/check-exist';

      const response = await fetch(`${apiBaseUrl}${checkEmailPath}`, {
        method: 'POST',
        headers: {
          Accept: 'application/json, text/plain, */*',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
        }),
      });

      const rawPayload: unknown = await response.json().catch(() => null);

      if (!response.ok) {
        const errorBody = rawPayload as { message?: string } | null;
        throw new Error(
          errorBody?.message ?? 'Unable to verify email availability. Please try again.',
        );
      }

      const payloadObj =
        rawPayload && typeof rawPayload === 'object'
          ? (rawPayload as { exist?: boolean; data?: { exist?: boolean } })
          : null;
      const emailExists = Boolean(payloadObj?.data?.exist ?? payloadObj?.exist);

      if (emailExists) {
        setErrorMessage(
          'This email is already registered. Please sign in or use a different email.',
        );
        return;
      }

      setStep(2);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Unable to verify email availability right now.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateAccount = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);

    if (!PASSWORD_COMPLEXITY_REGEX.test(password)) {
      setErrorMessage(
        'Password must be at least 8 characters and include an uppercase letter, a number, and a symbol (#?!@$%^&*-).',
      );
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    try {
      const apiBaseUrl =
        process.env.NEXT_PUBLIC_TJAP_API_URL ?? 'https://api.thejobapplicantperspective.com';
      const registerPath = process.env.NEXT_PUBLIC_TJAP_HR_REGISTER_PATH ?? '/api/v1/auth/signup';

      const response = await fetch(`${apiBaseUrl}${registerPath}`, {
        method: 'POST',
        headers: {
          Accept: 'application/json, text/plain, */*',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          companyName: companyName.trim(),
          industry,
          employmentCount,
          location: location.trim(),
          password,
          role: 'hr',
        }),
      });

      const rawPayload: unknown = await response.json().catch(() => null);

      if (!response.ok) {
        const errorBody = rawPayload as { message?: string } | null;
        throw new Error(
          errorBody?.message ??
            'Unable to create account. Please review your details and try again.',
        );
      }

      const resolvedId = extractUserId(rawPayload);
      if (resolvedId) {
        setHrUserId(resolvedId);
      }

      const parsed = HrLoginResponseSchema.safeParse(rawPayload);
      if (parsed.success) {
        window.localStorage.setItem(HR_TOKEN_STORAGE_KEY, parsed.data.data.token);
        window.localStorage.setItem(HR_USER_STORAGE_KEY, JSON.stringify(parsed.data.data.user));
        setHasSessionToken(true);
        if (!resolvedId && parsed.data.data.user._id) {
          setHrUserId(parsed.data.data.user._id);
        }
      }

      setStep(3);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Unable to create your HR account right now.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddSocialRow = () => {
    if (socialLinks.length >= SOCIAL_PLATFORM_OPTIONS.length) return;
    setSocialLinks((prev) => [...prev, createEmptySocialRow(nextRowSeed)]);
    setNextRowSeed((prev) => prev + 1);
  };

  const handleRemoveSocialRow = (id: string) => {
    if (socialLinks.length <= 1) return;
    setSocialLinks((prev) => prev.filter((row) => row.id !== id));
  };

  const handleUpdateSocialRow = (id: string, field: 'name' | 'link', value: string) => {
    setSocialLinks((prev) =>
      prev.map((row) =>
        row.id === id
          ? {
              ...row,
              [field]: field === 'name' ? (value as SocialPlatform) : value,
            }
          : row,
      ),
    );
  };

  const handleSaveSocialLinks = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);

    const populatedRows = socialLinks.filter(
      (row) => row.name.trim().length > 0 || row.link.trim().length > 0,
    );

    if (populatedRows.length === 0) {
      router.push(hasSessionToken ? '/' : '/login');
      return;
    }

    for (let i = 0; i < populatedRows.length; i += 1) {
      const row = populatedRows[i];
      if (!row.name) {
        setErrorMessage(`Please select a platform for social link #${i + 1}.`);
        return;
      }
      const trimmedLink = row.link.trim();
      if (!trimmedLink || !isValidPlatformUrl(row.name, trimmedLink)) {
        const label = row.name === 'general' ? 'website' : row.name;
        setErrorMessage(`Please enter a valid ${label} URL (starting with http:// or https://).`);
        return;
      }
    }

    const sanitizedLinks = populatedRows.map((row) => ({
      name: row.name,
      link: row.link.trim(),
    }));

    const token = window.localStorage.getItem(HR_TOKEN_STORAGE_KEY);
    if (!token) {
      router.push('/login');
      return;
    }

    let resolvedUserId = hrUserId;
    const existingUserRaw = window.localStorage.getItem(HR_USER_STORAGE_KEY);
    if (!resolvedUserId && existingUserRaw) {
      try {
        const parsedUser = JSON.parse(existingUserRaw) as { _id?: string; id?: string };
        resolvedUserId = parsedUser._id ?? parsedUser.id ?? null;
      } catch {
        resolvedUserId = null;
      }
    }

    if (!resolvedUserId) {
      setErrorMessage(
        'Missing HR user identifier. Please skip this step and update from settings.',
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const apiBaseUrl =
        process.env.NEXT_PUBLIC_TJAP_API_URL ?? 'https://api.thejobapplicantperspective.com';
      const usersBasePath = process.env.NEXT_PUBLIC_TJAP_HR_USERS_PATH ?? '/api/v1/users';

      const response = await fetch(
        `${apiBaseUrl}${usersBasePath}/${encodeURIComponent(resolvedUserId)}`,
        {
          method: 'PUT',
          headers: {
            Accept: 'application/json, text/plain, */*',
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: name.trim(),
            email: email.trim(),
            companyName: companyName.trim(),
            industry,
            employmentCount,
            location: location.trim(),
            socialLinks: sanitizedLinks,
          }),
        },
      );

      const rawPayload: unknown = await response.json().catch(() => null);

      if (!response.ok) {
        const errorBody = rawPayload as { message?: string } | null;
        throw new Error(
          errorBody?.message ?? 'Unable to save social media links. You can also skip this step.',
        );
      }

      if (existingUserRaw) {
        try {
          const existingUser = JSON.parse(existingUserRaw) as Record<string, unknown>;
          window.localStorage.setItem(
            HR_USER_STORAGE_KEY,
            JSON.stringify({ ...existingUser, socialLinks: sanitizedLinks }),
          );
        } catch {
          // Ignore malformed local cache; HrAuthProvider re-hydrates via /auth/me on mount
        }
      }

      router.push('/');
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Unable to save company social links right now.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedPlatforms = socialLinks
    .map((row) => row.name)
    .filter((platform): platform is Exclude<SocialPlatform, ''> => platform !== '');

  const stepHeading =
    step === 1
      ? 'Create an HR account'
      : step === 2
        ? 'Secure your account'
        : 'Add more details about your company';

  const stepSubtitle =
    step === 1
      ? 'Step 1 of 3 — Organization Profile'
      : step === 2
        ? 'Step 2 of 3 — Create a strong password for your account'
        : 'Step 3 of 3 — Company Social Profiles (Optional)';

  return (
    <div className="relative min-h-screen w-full bg-[#F8FAFC]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-[#0D3276]"
      />

      <header className="relative z-10 mx-auto flex w-full justify-center px-[5vw] py-10 md:fixed md:justify-start">
        <Link
          href="/"
          className="inline-flex items-center rounded-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
        >
          <Image
            src={logoSrc}
            alt="The Job Applicant Perspective HR"
            width={247}
            height={41}
            priority
            className="h-auto w-[220px] md:w-[247px]"
          />
        </Link>
      </header>

      <main className="relative z-10 flex min-h-[calc(100vh-121px)] w-full items-end md:grid md:min-h-screen md:place-items-center md:px-4 md:py-24">
        <div
          className={`w-full rounded-t-2xl bg-white px-[5vw] pt-10 pb-16 shadow-[0_8px_30px_rgba(0,0,0,0.08)] md:rounded-2xl md:px-16 md:py-10 ${
            step === 1 ? 'md:w-[765px]' : 'md:w-[570px]'
          }`}
        >
          <h1 className="text-center text-2xl font-bold tracking-tight text-[#111827]">
            {stepHeading}
          </h1>
          <p className="mt-2 text-center text-sm font-medium text-[#595959]">{stepSubtitle}</p>

          {errorMessage && (
            <div
              role="alert"
              aria-live="assertive"
              className="mt-6 rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm font-medium text-red-900"
            >
              {errorMessage}
            </div>
          )}

          {step === 1 && (
            <form onSubmit={handleNextStep} noValidate className="mt-8 flex flex-col gap-4">
              {/* Row 1: Full Name & Email */}
              <div className="flex flex-col gap-4 md:flex-row md:gap-3">
                <div className="flex w-full flex-col">
                  <label
                    htmlFor="hr-register-name"
                    className="text-base font-medium text-[#374151]"
                  >
                    Full Name
                  </label>
                  <input
                    id="hr-register-name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    required
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    className="mt-1 h-14 rounded-lg border border-[#D0D9E9] bg-white px-4 text-base text-[#111827] transition-colors focus:border-[#0D3276] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0D3276]"
                  />
                </div>

                <div className="flex w-full flex-col">
                  <label
                    htmlFor="hr-register-email"
                    className="text-base font-medium text-[#374151]"
                  >
                    Email
                  </label>
                  <input
                    id="hr-register-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="mt-1 h-14 rounded-lg border border-[#D0D9E9] bg-white px-4 text-base text-[#111827] transition-colors focus:border-[#0D3276] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0D3276]"
                  />
                </div>
              </div>

              {/* Row 2: Company Name & Industry */}
              <div className="flex flex-col gap-4 md:flex-row md:gap-3">
                <div className="flex w-full flex-col">
                  <label
                    htmlFor="hr-register-company"
                    className="text-base font-medium text-[#374151]"
                  >
                    Company Name
                  </label>
                  <input
                    id="hr-register-company"
                    name="companyName"
                    type="text"
                    autoComplete="organization"
                    required
                    value={companyName}
                    onChange={(event) => setCompanyName(event.target.value)}
                    className="mt-1 h-14 rounded-lg border border-[#D0D9E9] bg-white px-4 text-base text-[#111827] transition-colors focus:border-[#0D3276] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0D3276]"
                  />
                </div>

                <div className="flex w-full flex-col">
                  <label
                    htmlFor="hr-register-industry"
                    className="text-base font-medium text-[#374151]"
                  >
                    Industry
                  </label>
                  <div className="relative mt-1 w-full">
                    <select
                      id="hr-register-industry"
                      name="industry"
                      required
                      value={industry}
                      onChange={(event) => setIndustry(event.target.value)}
                      className="h-14 w-full appearance-none rounded-lg border border-[#D0D9E9] bg-white pr-10 pl-4 text-base text-[#111827] transition-colors focus:border-[#0D3276] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0D3276]"
                    >
                      <option value="" disabled>
                        Select
                      </option>
                      {HR_INDUSTRY_OPTIONS.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      aria-hidden="true"
                      className="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-[#434343]"
                    />
                  </div>
                </div>
              </div>

              {/* Row 3: No of employees & Location */}
              <div className="flex flex-col gap-4 md:flex-row md:gap-3">
                <div className="flex w-full flex-col">
                  <label
                    htmlFor="hr-register-employees"
                    className="text-base font-medium text-[#374151]"
                  >
                    No of employees
                  </label>
                  <div className="relative mt-1 w-full">
                    <select
                      id="hr-register-employees"
                      name="employmentCount"
                      required
                      value={employmentCount}
                      onChange={(event) => setEmploymentCount(event.target.value)}
                      className="h-14 w-full appearance-none rounded-lg border border-[#D0D9E9] bg-white pr-10 pl-4 text-base text-[#111827] transition-colors focus:border-[#0D3276] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0D3276]"
                    >
                      <option value="" disabled>
                        Select
                      </option>
                      {HR_EMPLOYMENT_COUNT_OPTIONS.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      aria-hidden="true"
                      className="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-[#434343]"
                    />
                  </div>
                </div>

                <div className="flex w-full flex-col">
                  <label
                    htmlFor="hr-register-location"
                    className="text-base font-medium text-[#374151]"
                  >
                    Location
                  </label>
                  <input
                    id="hr-register-location"
                    name="location"
                    type="text"
                    placeholder="City, State"
                    autoComplete="address-level2"
                    required
                    value={location}
                    onChange={(event) => setLocation(event.target.value)}
                    className="mt-1 h-14 rounded-lg border border-[#D0D9E9] bg-white px-4 text-base text-[#111827] transition-colors placeholder:text-[#595959] focus:border-[#0D3276] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0D3276]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-4 w-full rounded-lg bg-[#0D3276] px-6 py-4 text-base font-bold text-white transition-colors hover:bg-[#081F48] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0D3276] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? 'Checking email...' : 'Next'}
              </button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleCreateAccount} noValidate className="mt-8 flex flex-col gap-4">
              <div className="flex w-full flex-col">
                <label
                  htmlFor="hr-register-password"
                  className="text-base font-medium text-[#374151]"
                >
                  New password
                </label>
                <div className="relative mt-1 w-full">
                  <input
                    id="hr-register-password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    aria-describedby="hr-password-requirements"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="h-14 w-full rounded-lg border border-[#D0D9E9] bg-white pr-12 pl-4 text-base text-[#111827] transition-colors focus:border-[#0D3276] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0D3276]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    aria-pressed={showPassword}
                    className="absolute top-1/2 right-3 -translate-y-1/2 rounded-md p-2 text-[#595959] hover:text-[#0D3276] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0D3276]"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" aria-hidden="true" />
                    ) : (
                      <Eye className="h-5 w-5" aria-hidden="true" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex w-full flex-col">
                <label
                  htmlFor="hr-register-confirm-password"
                  className="text-base font-medium text-[#374151]"
                >
                  Confirm password
                </label>
                <input
                  id="hr-register-confirm-password"
                  name="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  className="mt-1 h-14 rounded-lg border border-[#D0D9E9] bg-white px-4 text-base text-[#111827] transition-colors focus:border-[#0D3276] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0D3276]"
                />
              </div>

              <ul
                id="hr-password-requirements"
                aria-live="polite"
                className="flex flex-col gap-1.5 pt-1 pl-1 text-sm text-[#374151]"
              >
                <li className="flex items-center gap-2">
                  {passwordChecks.length ? (
                    <Check className="h-4 w-4 text-[#0D3276]" aria-hidden="true" />
                  ) : (
                    <Circle className="h-3 w-3 text-[#595959]" aria-hidden="true" />
                  )}
                  <span>At least 8 characters</span>
                </li>
                <li className="flex items-center gap-2">
                  {passwordChecks.hasNumber ? (
                    <Check className="h-4 w-4 text-[#0D3276]" aria-hidden="true" />
                  ) : (
                    <Circle className="h-3 w-3 text-[#595959]" aria-hidden="true" />
                  )}
                  <span>At least one number (0-9)</span>
                </li>
                <li className="flex items-center gap-2">
                  {passwordChecks.hasSymbol ? (
                    <Check className="h-4 w-4 text-[#0D3276]" aria-hidden="true" />
                  ) : (
                    <Circle className="h-3 w-3 text-[#595959]" aria-hidden="true" />
                  )}
                  <span>At least one symbol (#?!@$%^&amp;*-)</span>
                </li>
                <li className="flex items-center gap-2">
                  {passwordChecks.hasUppercase ? (
                    <Check className="h-4 w-4 text-[#0D3276]" aria-hidden="true" />
                  ) : (
                    <Circle className="h-3 w-3 text-[#595959]" aria-hidden="true" />
                  )}
                  <span>At least one uppercase letter</span>
                </li>
              </ul>

              <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => {
                    setErrorMessage(null);
                    setStep(1);
                  }}
                  className="w-full rounded-lg border border-[#D0D9E9] bg-white px-6 py-4 text-base font-bold text-[#0D3276] transition-colors hover:bg-[#F1F5F9] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0D3276] sm:w-1/3"
                >
                  Go back
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full rounded-lg bg-[#0D3276] px-6 py-4 text-base font-bold text-white transition-colors hover:bg-[#081F48] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0D3276] disabled:cursor-not-allowed disabled:opacity-60 sm:w-2/3"
                >
                  {isSubmitting ? 'Creating account...' : 'Create account'}
                </button>
              </div>
            </form>
          )}

          {step === 3 && (
            <form onSubmit={handleSaveSocialLinks} noValidate className="mt-8 flex flex-col gap-5">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-[#374151]">
                  Add social media links{' '}
                  <span className="ml-1 text-sm font-medium text-[#595959]">(Optional)</span>
                </h2>
                <button
                  type="button"
                  onClick={handleAddSocialRow}
                  disabled={socialLinks.length >= SOCIAL_PLATFORM_OPTIONS.length}
                  className="rounded px-2 py-1 text-sm font-bold text-[#0D3276] hover:bg-[#F1F5F9] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0D3276] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  +Add
                </button>
              </div>

              <div className="flex flex-col gap-4">
                {socialLinks.map((row, index) => {
                  const inputId = `socialLinks.${index}.link`;
                  const selectId = `socialLinks.${index}.name`;

                  return (
                    <div key={row.id} className="flex flex-col gap-1.5">
                      <label htmlFor={inputId} className="text-sm font-medium text-[#374151]">
                        Paste URL
                      </label>
                      <div className="flex items-stretch gap-2">
                        <div className="flex min-w-0 grow items-center rounded-lg border border-[#D0D9E9] bg-white px-3 focus-within:border-[#0D3276]">
                          <div className="relative shrink-0">
                            <select
                              id={selectId}
                              name={selectId}
                              aria-label={`Social media platform ${index + 1}`}
                              value={row.name}
                              onChange={(event) =>
                                handleUpdateSocialRow(row.id, 'name', event.target.value)
                              }
                              className="h-13 appearance-none bg-transparent pr-7 pl-1 text-sm font-medium text-[#111827] capitalize focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0D3276]"
                            >
                              <option value="">Select</option>
                              {SOCIAL_PLATFORM_OPTIONS.map((opt) => (
                                <option
                                  key={opt.value}
                                  value={opt.value}
                                  disabled={
                                    selectedPlatforms.includes(opt.value) && row.name !== opt.value
                                  }
                                >
                                  {opt.label}
                                </option>
                              ))}
                            </select>
                            <ChevronDown
                              aria-hidden="true"
                              className="pointer-events-none absolute top-1/2 right-1.5 h-4 w-4 -translate-y-1/2 text-[#434343]"
                            />
                          </div>

                          <div
                            aria-hidden="true"
                            className="mx-2 h-5 w-[1px] shrink-0 bg-[#CBD5E1]"
                          />

                          <input
                            id={inputId}
                            name={inputId}
                            type="url"
                            placeholder="https://"
                            value={row.link}
                            onChange={(event) =>
                              handleUpdateSocialRow(row.id, 'link', event.target.value)
                            }
                            className="h-13 min-w-0 grow bg-transparent px-1 text-base text-[#111827] placeholder:text-[#595959] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0D3276]"
                          />
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveSocialRow(row.id)}
                          disabled={socialLinks.length <= 1}
                          aria-label={`Remove social link ${index + 1}`}
                          className="flex w-13 shrink-0 items-center justify-center rounded-lg bg-[#FFF0F0] text-[#B91C1C] transition-opacity hover:opacity-85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0D3276] disabled:cursor-not-allowed disabled:opacity-35"
                        >
                          <Minus className="h-4 w-4" aria-hidden="true" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-2 flex flex-col gap-3 sm:flex-row-reverse">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full rounded-lg bg-[#0D3276] px-6 py-4 text-base font-bold text-white transition-colors hover:bg-[#081F48] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0D3276] disabled:cursor-not-allowed disabled:opacity-60 sm:w-1/2"
                >
                  {isSubmitting ? 'Saving...' : 'Add'}
                </button>
                <Link
                  href={hasSessionToken ? '/' : '/login'}
                  className="inline-flex w-full items-center justify-center rounded-lg border border-[#D0D9E9] bg-white px-6 py-4 text-base font-bold text-[#0D3276] transition-colors hover:bg-[#F1F5F9] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0D3276] sm:w-1/2"
                >
                  Skip
                </Link>
              </div>
            </form>
          )}

          {step !== 3 && (
            <>
              <p className="my-4 text-center text-base font-bold text-[#595959]">or</p>

              <div className="flex items-center justify-center gap-2 text-center text-base font-bold text-[#595959] md:mb-6">
                <span>Already have an account?</span>
                <Link
                  href="/login"
                  className="rounded text-[#0D3276] underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0D3276]"
                >
                  Sign in
                </Link>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};
