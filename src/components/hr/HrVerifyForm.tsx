'use client';

import { useState, type FormEvent } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { z } from 'zod';

interface HrVerifyFormProps {
  logoSrc?: string;
}

const HrVerifyEmailSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'Email is required.')
    .email('Please enter a valid email address.'),
});

const getApiBaseUrl = (): string =>
  (process.env.NEXT_PUBLIC_TJAP_API_URL ?? '').trim().replace(/\/+$/, '');

export const HrVerifyForm = ({ logoSrc = '/logosm.svg' }: HrVerifyFormProps) => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);

    const validation = HrVerifyEmailSchema.safeParse({ email });
    if (!validation.success) {
      setErrorMessage(validation.error.issues[0]?.message ?? 'Please enter a valid email address.');
      return;
    }

    setIsSubmitting(true);
    try {
      const apiBaseUrl = getApiBaseUrl();
      const verifyPath =
        process.env.NEXT_PUBLIC_TJAP_HR_VERIFY_PATH ?? '/api/v1/auth/forgot-password';

      const response = await fetch(`${apiBaseUrl}${verifyPath}`, {
        method: 'POST',
        headers: {
          Accept: 'application/json, text/plain, */*',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: validation.data.email,
          role: 'hr',
        }),
      });

      const rawPayload: unknown = await response.json().catch(() => null);

      if (!response.ok) {
        const errorBody = rawPayload as { message?: string } | null;
        throw new Error(
          errorBody?.message ?? 'Unable to send verification email. Please try again.',
        );
      }

      router.push('/login');
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'An error occurred while sending the reset link. Please try again.',
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
        <div className="w-full rounded-t-2xl bg-white px-[5vw] pt-10 pb-16 shadow-[0_8px_30px_rgba(0,0,0,0.08)] md:w-[570px] md:rounded-2xl md:px-16 md:py-10">
          <Link
            href="/login"
            className="mb-6 inline-flex items-center gap-1.5 rounded text-base font-bold text-[#0D3276] underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0D3276] md:hidden"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            <span>Go back</span>
          </Link>

          <h1 className="text-center text-2xl font-bold tracking-tight text-[#111827]">
            Verify your account
          </h1>
          <p className="mt-2 text-center text-base font-medium text-[#595959]">
            We&apos;ll send a password reset link to this email
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

          <form onSubmit={handleSubmit} noValidate className="mt-8 flex flex-col gap-4">
            <div className="flex w-full flex-col">
              <label htmlFor="hr-verify-email" className="text-base font-medium text-[#374151]">
                Email
              </label>
              <input
                id="hr-verify-email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="mt-1 h-14 rounded-lg border border-[#D0D9E9] bg-white px-4 text-base text-[#111827] transition-colors focus:border-[#0D3276] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0D3276]"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-2 w-full rounded-lg bg-[#0D3276] px-6 py-4 text-base font-bold text-white transition-colors hover:bg-[#081F48] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0D3276] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? 'Sending...' : 'Send'}
            </button>
          </form>

          <div className="mt-6 hidden justify-center md:flex">
            <Link
              href="/login"
              className="rounded text-base font-bold text-[#595959] underline-offset-4 hover:text-[#0D3276] hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0D3276]"
            >
              Go back
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};
