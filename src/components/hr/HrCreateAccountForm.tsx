'use client';

import { useState, type FormEvent } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronDown, Eye, EyeOff } from 'lucide-react';
import { HR_EMPLOYMENT_COUNT_OPTIONS, HR_INDUSTRY_OPTIONS } from '@/lib/constants/hrOptions';
import { HrCreateAccountStepOneSchema, HrLoginResponseSchema } from '@/lib/dto/hrAuth';
import { HR_TOKEN_STORAGE_KEY, HR_USER_STORAGE_KEY } from '@/lib/api/hrSession';

interface HrCreateAccountFormProps {
  logoSrc?: string;
}

export const HrCreateAccountForm = ({
  logoSrc = '/images/tjap-logo.png',
}: HrCreateAccountFormProps) => {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [industry, setIndustry] = useState('');
  const [employmentCount, setEmploymentCount] = useState('');
  const [location, setLocation] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNextStep = (event: FormEvent<HTMLFormElement>) => {
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

    setStep(2);
  };

  const handleCreateAccount = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);

    if (password.length < 8) {
      setErrorMessage('Password must be at least 8 characters long.');
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
      const registerPath = process.env.NEXT_PUBLIC_TJAP_HR_REGISTER_PATH ?? '/api/v1/auth/register';

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

      const parsed = HrLoginResponseSchema.safeParse(rawPayload);
      if (parsed.success) {
        window.localStorage.setItem(HR_TOKEN_STORAGE_KEY, parsed.data.data.token);
        window.localStorage.setItem(HR_USER_STORAGE_KEY, JSON.stringify(parsed.data.data.user));
        router.push('/');
        return;
      }

      router.push('/login');
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Unable to create your HR account right now.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

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
        <div className="w-full rounded-t-2xl bg-white px-[5vw] pt-10 pb-16 shadow-[0_8px_30px_rgba(0,0,0,0.08)] md:w-[765px] md:rounded-2xl md:px-16 md:py-10">
          <h1 className="text-center text-2xl font-bold tracking-tight text-[#111827]">
            Create an HR account
          </h1>
          <p className="mt-2 text-center text-sm font-medium text-[#595959]">
            Step {step} of 2 — {step === 1 ? 'Organization Profile' : 'Account Security'}
          </p>

          {errorMessage && (
            <div
              role="alert"
              aria-live="assertive"
              className="mt-6 rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm font-medium text-red-900"
            >
              {errorMessage}
            </div>
          )}

          {step === 1 ? (
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
                className="mt-4 w-full rounded-lg bg-[#0D3276] px-6 py-4 text-base font-bold text-white transition-colors hover:bg-[#081F48] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0D3276]"
              >
                Next
              </button>
            </form>
          ) : (
            <form onSubmit={handleCreateAccount} noValidate className="mt-8 flex flex-col gap-4">
              <div className="flex w-full flex-col">
                <label
                  htmlFor="hr-register-password"
                  className="text-base font-medium text-[#374151]"
                >
                  Password
                </label>
                <div className="relative mt-1 w-full">
                  <input
                    id="hr-register-password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
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
                  Confirm Password
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

              <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => {
                    setErrorMessage(null);
                    setStep(1);
                  }}
                  className="w-full rounded-lg border border-[#D0D9E9] bg-white px-6 py-4 text-base font-bold text-[#0D3276] transition-colors hover:bg-[#F1F5F9] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0D3276] sm:w-1/3"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full rounded-lg bg-[#0D3276] px-6 py-4 text-base font-bold text-white transition-colors hover:bg-[#081F48] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0D3276] disabled:cursor-not-allowed disabled:opacity-60 sm:w-2/3"
                >
                  {isSubmitting ? 'Creating account...' : 'Create Account'}
                </button>
              </div>
            </form>
          )}

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
        </div>
      </main>
    </div>
  );
};
