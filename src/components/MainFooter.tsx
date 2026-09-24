// components/MainFooter.tsx
import Image from 'next/image';
import Link from 'next/link';

export const MainFooter = () => {
  return (
    <footer className="w-full bg-[#081F48]">
      <div className="container mx-auto px-4 py-12 md:px-8 md:py-24 lg:px-12">
        <div className="flex flex-col justify-between gap-12 md:flex-row">
          <div className="w-full md:w-1/2 lg:w-5/12">
            <h2 className="text-3xl leading-tight font-semibold text-white md:text-5xl">
              We’re here to answer all your questions
            </h2>
            <p className="mt-4 text-base text-neutral-200">
              Your journey’s important to us. Need help, resources, or just someone to talk to?
              we’re just a message away!
            </p>
          </div>

          <div className="w-full md:w-1/2">
            <form className="flex flex-col gap-4" action="/api/contact" method="POST">
              <div className="flex flex-col gap-4 md:flex-row">
                <div className="w-full">
                  <label htmlFor="contact-name" className="sr-only">
                    Name
                  </label>
                  <input
                    id="contact-name"
                    name="name"
                    placeholder="Name"
                    type="text"
                    required
                    className="w-full rounded-md border border-neutral-600 bg-transparent px-4 py-3 text-white placeholder:text-neutral-400 focus:ring-2 focus:ring-white focus:outline-none"
                  />
                </div>
                <div className="w-full">
                  <label htmlFor="contact-email" className="sr-only">
                    Email
                  </label>
                  <input
                    id="contact-email"
                    name="email"
                    placeholder="Email"
                    type="email"
                    required
                    className="w-full rounded-md border border-neutral-600 bg-transparent px-4 py-3 text-white placeholder:text-neutral-400 focus:ring-2 focus:ring-white focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="contact-message" className="sr-only">
                  Message
                </label>
                <textarea
                  id="contact-message"
                  name="message"
                  placeholder="Message"
                  required
                  className="h-32 w-full resize-none rounded-md border border-neutral-600 bg-transparent px-4 py-3 text-white placeholder:text-neutral-400 focus:ring-2 focus:ring-white focus:outline-none md:h-48"
                />
              </div>
              <div className="mt-2">
                <button
                  type="submit"
                  className="text-primary focus:ring-primary rounded-md bg-white px-6 py-3 font-semibold transition-colors hover:bg-neutral-100 focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#081F48] focus:outline-none"
                >
                  Send Message
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="mt-16 h-px w-full bg-neutral-700" role="presentation" />

        <div className="mt-8 flex flex-col items-center justify-between gap-6 md:flex-row">
          <ul className="m-0 flex list-none gap-8 p-0">
            <li>
              <Link
                href="/who-we-are"
                className="rounded-sm text-neutral-300 transition-colors hover:text-white focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
              >
                About us
              </Link>
            </li>
            <li>
              <Link
                href="/privacy-policy"
                className="rounded-sm text-neutral-300 transition-colors hover:text-white focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
              >
                Privacy policy
              </Link>
            </li>
          </ul>

          <div className="flex gap-6">
            <Link
              href="https://www.facebook.com/thejobapplicantperspective/"
              aria-label="Facebook page"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-sm opacity-70 transition-opacity hover:opacity-100 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
            >
              <Image src="/fb.svg" alt="" width={24} height={24} aria-hidden="true" />
            </Link>
            <Link
              href="https://x.com/"
              aria-label="X (Twitter) profile"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-sm opacity-70 transition-opacity hover:opacity-100 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
            >
              <Image src="/twitter.svg" alt="" width={24} height={24} aria-hidden="true" />
            </Link>
            <Link
              href="https://www.instagram.com/jobapplicantperspective"
              aria-label="Instagram profile"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-sm opacity-70 transition-opacity hover:opacity-100 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
            >
              <Image src="/instagram.svg" alt="" width={24} height={24} aria-hidden="true" />
            </Link>
            <Link
              href="https://www.linkedin.com/company/the-job-applicant-perspective/"
              aria-label="LinkedIn company page"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-sm opacity-70 transition-opacity hover:opacity-100 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
            >
              <Image src="/linkedin.svg" alt="" width={24} height={24} aria-hidden="true" />
            </Link>
          </div>
        </div>

        <div className="mt-12 text-center text-sm text-neutral-400">
          Copyright © {new Date().getFullYear()} • thejobapplicantperspective
        </div>
      </div>
    </footer>
  );
};
