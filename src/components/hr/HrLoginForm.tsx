'use client';

import { useState, type FormEvent } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';
import { HrLoginResponseSchema } from '@/lib/dto/hrAuth';

interface HrLoginFormProps {
  logoSrc?: string;
}

const HR_TOKEN_STORAGE_KEY = 'tjap_hr_token';
const HR_USER_STORAGE_KEY = 'tjap_hr_user';

export const HrLoginForm = ({ logoSrc = '/logosm.svg' }: HrLoginFormProps) => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      setErrorMessage('Please enter both your email address and password.');
      return;
    }

    setIsSubmitting(true);
    try {
      const apiBaseUrl =
        process.env.NEXT_PUBLIC_TJAP_API_URL ?? 'https://api.thejobapplicantperspective.com';

      const response = await fetch(`${apiBaseUrl}/api/v1/auth/login`, {
        method: 'POST',
        headers: {
          Accept: 'application/json, text/plain, */*',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: trimmedEmail,
          password,
          role: 'hr',
        }),
      });

      const rawPayload: unknown = await response.json().catch(() => null);

      if (!response.ok) {
        const errorBody = rawPayload as { message?: string } | null;
        throw new Error(
          errorBody?.message ?? 'Invalid credentials. Please check your email and password.',
        );
      }

      const parsed = HrLoginResponseSchema.safeParse(rawPayload);
      if (!parsed.success) {
        throw new Error('Unexpected authentication response format from server.');
      }

      window.localStorage.setItem(HR_TOKEN_STORAGE_KEY, parsed.data.data.token);
      window.localStorage.setItem(HR_USER_STORAGE_KEY, JSON.stringify(parsed.data.data.user));

      router.push('/');
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Unable to sign in right now. Please try again.',
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

      <main className="relative z-10 flex min-h-[calc(100vh-121px)] w-full items-end md:grid md:min-h-screen md:place-items-center md:px-4">
        <div className="w-full rounded-t-2xl bg-white px-[5vw] pt-10 pb-16 shadow-[0_8px_30px_rgba(0,0,0,0.08)] md:w-[570px] md:rounded-2xl md:px-16 md:py-10">
          <h1 className="text-center text-2xl font-bold tracking-tight text-[#111827]">HR Login</h1>

          {errorMessage && (
            <div
              role="alert"
              aria-live="assertive"
              className="mt-6 rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm font-medium text-red-900"
            >
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="mt-8 flex flex-col gap-4">
            <div className="flex w-full flex-col">
              <label htmlFor="hr-login-email" className="text-base font-medium text-[#374151]">
                Email
              </label>
              <input
                id="hr-login-email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="mt-1 rounded-lg border border-[#D1D5DB] bg-white p-4 text-base text-[#111827] transition-colors focus:border-[#0D3276] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0D3276]"
              />
            </div>

            <div className="flex w-full flex-col">
              <label htmlFor="hr-login-password" className="text-base font-medium text-[#374151]">
                Password
              </label>
              <div className="relative mt-1 w-full">
                <input
                  id="hr-login-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="w-full rounded-lg border border-[#D1D5DB] bg-white p-4 pr-12 text-base text-[#111827] transition-colors focus:border-[#0D3276] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0D3276]"
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

            <div className="w-full text-end">
              <Link
                href="/verify"
                className="rounded text-base font-bold text-[#0D3276] underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0D3276]"
              >
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-2 w-full rounded-lg bg-[#0D3276] px-6 py-4 text-base font-bold text-white transition-colors hover:bg-[#081F48] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0D3276] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <p className="my-4 text-center text-base font-bold text-[#595959]">or</p>

          <div className="flex items-center justify-center gap-2 text-center text-base font-bold text-[#595959] md:mb-6">
            <span>Don&apos;t have an account?</span>
            <Link
              href="/create-account"
              className="rounded text-[#0D3276] underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0D3276]"
            >
              Sign up
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};
