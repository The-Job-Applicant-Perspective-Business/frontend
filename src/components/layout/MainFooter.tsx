import React from 'react';
import Link from 'next/link';
import { storyblokEditable } from '@storyblok/react';
import { Button } from '@/components/ui/Button';
import { FormInput } from '@/components/blocks/FormInput';

export interface SocialLinkItem {
  platform: 'facebook' | 'twitter' | 'instagram' | 'linkedin';
  href: string;
  label: string;
}

export interface MainFooterProps {
  blok?: {
    _uid?: string;
    _editable?: string;
    Heading?: string;
    Description?: string;
    CopyrightText?: string;
    [key: string]: unknown;
  };
  className?: string;
}

const DEFAULT_SOCIAL_LINKS: SocialLinkItem[] = [
  {
    platform: 'facebook',
    href: 'https://www.facebook.com/thejobapplicantperspective/',
    label: 'Facebook',
  },
  {
    platform: 'twitter',
    href: 'https://x.com/',
    label: 'Twitter',
  },
  {
    platform: 'instagram',
    href: 'https://www.instagram.com/jobapplicantperspective',
    label: 'Instagram',
  },
  {
    platform: 'linkedin',
    href: 'https://www.linkedin.com/company/the-job-applicant-perspective/',
    label: 'LinkedIn',
  },
];

export const MainFooter = ({ blok, className = '' }: MainFooterProps) => {
  const currentYear = new Date().getFullYear();

  const headingText = blok?.Heading || 'We’re here to answer all your questions';
  const descriptionText =
    blok?.Description ||
    'Your journey’s important to us. Need help, resources, or just someone to talk to? we’re just a message away!';
  const copyrightText =
    blok?.CopyrightText || `Copyright © ${currentYear} • thejobapplicantperspective`;

  const inputOverrides =
    'border-slate-400 bg-transparent text-white placeholder:text-slate-300 ' +
    'focus-visible:ring-white focus-visible:ring-offset-[#081F48]';

  const editableProps = blok ? storyblokEditable(blok) : {};

  return (
    <footer
      {...editableProps}
      role="contentinfo"
      aria-labelledby="footer-heading"
      className={`w-full ${className}`.trim()}
    >
      <section className="w-full bg-[#081F48] text-white">
        <div className="px-[5vw] pt-[20px] md:pt-[113px]">
          {/* Upper Section: Split Content and Contact Form */}
          <div className="flex w-full flex-col md:flex-row md:justify-between md:gap-[5vw]">
            {/* Left Column: Mission / Support Prompt */}
            <div className="w-full md:w-[48%]">
              <h2
                id="footer-heading"
                className="text-[32px] leading-[41px] font-[600] text-[#FAFAFA] md:text-[48px] md:leading-[62px]"
              >
                {headingText}
              </h2>
              <p className="mt-[16px] text-[16px] leading-[24px] font-[400] text-[#E8E8E8]">
                {descriptionText}
              </p>
            </div>

            {/* Right Column: Contact Form */}
            <div className="mt-[40px] w-full md:mt-0 md:flex-1">
              <form className="flex w-full flex-col" action="/api/contact" method="POST">
                <div className="flex w-full flex-col gap-[12px] text-white md:flex-row md:gap-[26px]">
                  <div className="w-full">
                    <FormInput
                      id="footer-name"
                      name="name"
                      placeholder="Name"
                      type="text"
                      required
                      label="Name"
                      className={inputOverrides}
                    />
                  </div>
                  <div className="w-full">
                    <FormInput
                      id="footer-email"
                      name="email"
                      placeholder="Email"
                      type="email"
                      required
                      label="Email"
                      className={inputOverrides}
                    />
                  </div>
                </div>

                <div className="mt-[16px] md:mt-[36px]">
                  <FormInput
                    id="footer-message"
                    name="message"
                    placeholder="Message"
                    type="textarea"
                    required
                    label="Message"
                    className={`h-[212px] w-full resize-none ${inputOverrides}`}
                  />
                </div>

                <div className="mt-[16px] md:mt-[37px]">
                  <Button
                    type="submit"
                    className="text-primary min-h-12 rounded-[8px] bg-[#FAFAFA] px-[20px] py-[10px] font-[600] hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#081F48]"
                  >
                    Send Message
                  </Button>
                </div>
              </form>
            </div>
          </div>

          {/* Divider */}
          <div
            data-orientation="horizontal"
            role="none"
            className="mt-[66px] h-[1px] w-full bg-slate-700 text-white md:mt-[68px]"
          />

          {/* Lower Section: Navigation & Social Channels */}
          <div className="mt-[24px] flex flex-col justify-between md:flex-row md:items-center">
            {/* Live Navigation Links */}
            <nav aria-label="Footer Navigation">
              <ul className="flex items-center justify-between gap-6 md:justify-start md:gap-[40px]">
                <li>
                  <Link
                    href="/who-we-are"
                    className="text-[14px] text-white transition-opacity hover:opacity-80 focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
                  >
                    About us
                  </Link>
                </li>
                <li>
                  <Link
                    href="/privacy-policy"
                    className="text-[14px] text-white transition-opacity hover:opacity-80 focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
                  >
                    Privacy policy
                  </Link>
                </li>
              </ul>
            </nav>

            {/* Social Media Link Array */}
            <div className="mx-auto mt-[24px] flex items-center gap-[40px] md:mx-0 md:mt-0">
              {DEFAULT_SOCIAL_LINKS.map((social) => (
                <Link
                  key={social.platform}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white transition-opacity hover:opacity-80 focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
                >
                  <span className="sr-only">{social.label} (opens in a new tab)</span>
                  {social.platform === 'facebook' && (
                    <svg className="h-6 w-6 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                  )}
                  {social.platform === 'twitter' && (
                    <svg className="h-6 w-6 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                  )}
                  {social.platform === 'instagram' && (
                    <svg className="h-6 w-6 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                    </svg>
                  )}
                  {social.platform === 'linkedin' && (
                    <svg className="h-6 w-6 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                    </svg>
                  )}
                </Link>
              ))}
            </div>
          </div>

          {/* Bottom Copyright */}
          <div className="mt-[40px] flex items-center justify-center pb-[28px] text-[14px] font-[400] text-white opacity-70 md:mt-[90px] md:pb-[32px]">
            {copyrightText}
          </div>
        </div>
      </section>
    </footer>
  );
};

export default MainFooter;
