import React from 'react';
import { Button } from '@/components/ui/Button';
import { FormInput } from '@/components/blocks/FormInput';

export interface MainFooterProps {
  className?: string;
}

export const MainFooter = ({ className = '' }: MainFooterProps) => {
  const inputOverrides =
    'border-slate-400 bg-transparent text-white placeholder:text-slate-300 ' +
    'focus-visible:ring-white focus-visible:ring-offset-primary-dark';

  return (
    <footer
      aria-labelledby="footer-heading"
      className={`bg-primary-dark w-full text-white ${className}`.trim()}
    >
      <div className="px-gutter py-section mx-auto w-full max-w-7xl">
        <div className="gap-gutter flex flex-col justify-between md:flex-row">
          <div className="w-full md:w-1/2 lg:w-5/12">
            <h2
              id="footer-heading"
              className="leading-tight font-semibold text-[var(--text-fluid-3xl)] text-white"
            >
              We’re here to answer all your questions
            </h2>
            <p className="mt-4 leading-relaxed text-[var(--text-fluid-base)] text-slate-200">
              Your journey’s important to us. Need help, resources, or just someone to talk to?
              We’re just a message away!
            </p>
          </div>

          <div className="w-full md:w-1/2">
            <form className="flex flex-col gap-4" action="/api/contact" method="POST">
              <div className="flex flex-col gap-4 sm:flex-row">
                <FormInput
                  id="contact-name"
                  name="name"
                  placeholder="Name"
                  type="text"
                  required
                  label="Name"
                  className={inputOverrides}
                />
                <FormInput
                  id="contact-email"
                  name="email"
                  placeholder="Email"
                  type="email"
                  required
                  label="Email"
                  className={inputOverrides}
                />
              </div>

              <FormInput
                id="contact-message"
                name="message"
                placeholder="Message"
                type="textarea"
                required
                label="Message"
                className={`md:rows-6 resize-none ${inputOverrides}`}
              />

              <div className="mt-2">
                <Button
                  type="submit"
                  variant="secondary"
                  size="lg"
                  className="text-primary focus-visible:ring-offset-primary-dark min-h-12 bg-white hover:bg-slate-100 focus-visible:ring-white"
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
