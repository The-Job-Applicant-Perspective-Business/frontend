import React from 'react';
import { Button } from '@/components/ui/Button';

export interface MainFooterProps {
  className?: string;
}

export const MainFooter = ({ className = '' }: MainFooterProps) => {
  return (
    <footer
      aria-labelledby="footer-heading"
      className={`bg-primary-dark w-full text-white ${className}`.trim()}
    >
      <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 md:px-8 md:py-24 lg:px-12">
        <div className="flex flex-col justify-between gap-12 md:flex-row">
          <div className="w-full md:w-1/2 lg:w-5/12">
            <h2
              id="footer-heading"
              className="text-3xl leading-tight font-semibold text-white md:text-5xl"
            >
              We’re here to answer all your questions
            </h2>
            <p className="mt-4 text-base leading-relaxed text-slate-200">
              Your journey’s important to us. Need help, resources, or just someone to talk to?
              We’re just a message away!
            </p>
          </div>

          <div className="w-full md:w-1/2">
            <form className="flex flex-col gap-4" action="/api/contact" method="POST">
              <div className="flex flex-col gap-4 sm:flex-row">
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
                    className="focus-visible:ring-offset-primary-dark w-full rounded-md border border-slate-400 bg-transparent px-4 py-3 text-white transition-colors placeholder:text-slate-300 focus-visible:ring-3 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:outline-none"
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
                    className="focus-visible:ring-offset-primary-dark w-full rounded-md border border-slate-400 bg-transparent px-4 py-3 text-white transition-colors placeholder:text-slate-300 focus-visible:ring-3 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:outline-none"
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
                  rows={4}
                  className="focus-visible:ring-offset-primary-dark md:rows-6 w-full resize-none rounded-md border border-slate-400 bg-transparent px-4 py-3 text-white transition-colors placeholder:text-slate-300 focus-visible:ring-3 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:outline-none"
                />
              </div>

              <div className="mt-2">
                <Button
                  type="submit"
                  className="text-primary focus-visible:ring-offset-primary-dark inline-flex min-h-10 items-center justify-center rounded-md bg-white px-6 py-3 font-semibold transition-colors hover:bg-slate-100 focus-visible:ring-3 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-60"
                >
                  Send Message
                </Button>
              </div>
            </form>
          </div>
        </div>

        {/* Structural presentation divider */}
        <div className="mt-16 h-px w-full bg-slate-700" role="presentation" />

        <div className="mt-12 text-center text-sm text-slate-300">
          Copyright © {new Date().getFullYear()} • thejobapplicantperspective
        </div>
      </div>
    </footer>
  );
};

export default MainFooter;
