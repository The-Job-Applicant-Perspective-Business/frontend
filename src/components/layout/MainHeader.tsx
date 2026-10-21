'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export interface MainHeaderProps {
  logoSrc?: string;
  className?: string;
}

export const MainHeader = ({ logoSrc = '/logosm.svg', className = '' }: MainHeaderProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen((prev) => !prev);
  };

  return (
    <header className={`absolute top-0 z-50 w-full bg-transparent ${className}`.trim()}>
      {/* Mobile Navigation Bar */}
      <div className="flex items-center justify-between px-4 py-6 lg:hidden">
        <Link
          href="/"
          aria-label="Return to Homepage"
          className="focus-visible:ring-focus-ring focus-visible:ring-offset-background rounded-md focus-visible:ring-3 focus-visible:ring-offset-2 focus-visible:outline-none"
        >
          <Image src={logoSrc} alt="TJAP Logo" width={137} height={22} priority />
        </Link>
        <Button
          type="button"
          aria-haspopup="dialog"
          aria-expanded={isMobileMenuOpen}
          aria-controls="mobile-navigation-menu"
          aria-label={isMobileMenuOpen ? 'Close Navigation' : 'Open Navigation'}
          onClick={toggleMobileMenu}
          className="text-foreground hover:bg-muted focus-visible:ring-focus-ring focus-visible:ring-offset-background rounded-md p-2 transition-colors focus-visible:ring-3 focus-visible:ring-offset-2 focus-visible:outline-none"
        >
          {isMobileMenuOpen ? (
            <X className="h-6 w-6" aria-hidden="true" />
          ) : (
            <Menu className="h-6 w-6" aria-hidden="true" />
          )}
        </Button>
      </div>

      {/* Mobile Navigation Drawer */}
      {isMobileMenuOpen && (
        <div
          id="mobile-navigation-menu"
          role="dialog"
          aria-modal="true"
          aria-label="Mobile Navigation"
          className="border-border bg-background border-b px-6 py-6 shadow-lg lg:hidden"
        >
          <nav aria-label="Mobile Navigation Menu">
            <ul className="m-0 flex list-none flex-col gap-4 p-0">
              <li>
                <Link
                  href="/who-we-are"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-foreground hover:text-primary focus-visible:ring-focus-ring block rounded-md py-2 text-base font-semibold transition-colors focus-visible:ring-3 focus-visible:outline-none"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/job-insights"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-foreground hover:text-primary focus-visible:ring-focus-ring block rounded-md py-2 text-base font-semibold transition-colors focus-visible:ring-3 focus-visible:outline-none"
                >
                  Job Insights
                </Link>
              </li>
              <li className="pt-2">
                <Link
                  href="https://hr.thejobapplicantperspective.com/login"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-primary hover:bg-primary-light focus-visible:ring-focus-ring focus-visible:ring-offset-background inline-flex w-full items-center justify-center rounded-md px-4 py-2 text-base font-semibold text-white transition-colors focus-visible:ring-3 focus-visible:ring-offset-2 focus-visible:outline-none"
                >
                  Sign in as employer
                  <span className="sr-only"> (opens in a new tab)</span>
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      )}

      {/* Desktop Navigation Bar */}
      <div className="hidden w-full items-center justify-between bg-transparent px-8 py-10 lg:flex lg:px-12">
        <Link
          href="/"
          aria-label="Return to Homepage"
          className="focus-visible:ring-focus-ring focus-visible:ring-offset-background rounded-md focus-visible:ring-3 focus-visible:ring-offset-2 focus-visible:outline-none"
        >
          <Image src={logoSrc} alt="TJAP Logo" width={247} height={41} priority />
        </Link>
        <nav aria-label="Main Desktop Navigation" className="flex items-center">
          <ul className="m-0 flex list-none items-center gap-8 p-0">
            <li>
              <Link
                href="/who-we-are"
                className="text-foreground hover:text-primary focus-visible:ring-focus-ring focus-visible:ring-offset-background rounded-md text-base font-semibold transition-colors focus-visible:ring-3 focus-visible:ring-offset-2 focus-visible:outline-none"
              >
                About Us
              </Link>
            </li>
            <li>
              <Link
                href="/job-insights"
                className="text-foreground hover:text-primary focus-visible:ring-focus-ring focus-visible:ring-offset-background rounded-md text-base font-semibold transition-colors focus-visible:ring-3 focus-visible:ring-offset-2 focus-visible:outline-none"
              >
                Job Insights
              </Link>
            </li>
            <li>
              <Link
                href="https://hr.thejobapplicantperspective.com/login"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-primary hover:bg-primary-light focus-visible:ring-focus-ring focus-visible:ring-offset-background inline-flex items-center justify-center rounded-md px-4 py-2 text-base font-semibold text-white transition-colors focus-visible:ring-3 focus-visible:ring-offset-2 focus-visible:outline-none"
              >
                Sign in as employer
                <span className="sr-only"> (opens in a new tab)</span>
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default MainHeader;
