'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { NavLink } from '@/components/ui/NavLink';

export interface MainHeaderProps {
  logoSrc?: string;
  className?: string;
}

export const MainHeader = ({ logoSrc = '/logosm.svg', className = '' }: MainHeaderProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen((prev) => !prev);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <header className={`absolute top-0 z-50 w-full bg-transparent ${className}`.trim()}>
      {/* Mobile Navigation Bar */}
      <div className="px-gutter flex items-center justify-between py-6 lg:hidden">
        <Link
          href="/"
          aria-label="Return to Homepage"
          className="focus-visible:ring-focus-ring focus-visible:ring-offset-background rounded-md focus-visible:ring-3 focus-visible:ring-offset-2 focus-visible:outline-none"
        >
          <Image
            src={logoSrc}
            alt="TJAP Logo"
            width={137}
            height={22}
            priority
            style={{ width: 'auto' }}
          />
        </Link>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          aria-haspopup="dialog"
          aria-expanded={isMobileMenuOpen}
          aria-controls="mobile-navigation-menu"
          aria-label={isMobileMenuOpen ? 'Close Navigation' : 'Open Navigation'}
          onClick={toggleMobileMenu}
          className="inline-flex min-h-12 min-w-12 items-center justify-center p-2"
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
          className="border-border bg-background px-gutter border-b py-6 shadow-lg lg:hidden"
        >
          <nav aria-label="Mobile Navigation Menu">
            <ul className="m-0 flex list-none flex-col gap-2 p-0">
              <li>
                <NavLink
                  href="/who-we-are"
                  onClick={closeMobileMenu}
                  className="flex min-h-12 items-center font-semibold text-[var(--text-fluid-base)]"
                >
                  About Us
                </NavLink>
              </li>
              <li>
                <NavLink
                  href="/job-insights"
                  onClick={closeMobileMenu}
                  className="flex min-h-12 items-center font-semibold text-[var(--text-fluid-base)]"
                >
                  Job Insights
                </NavLink>
              </li>
              <li className="pt-2">
                <Link
                  href="https://hr.thejobapplicantperspective.com/login"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="focus-visible:outline-none"
                >
                  <Button variant="primary" size="md" className="min-h-12 w-full">
                    Sign in as employer
                    <span className="sr-only"> (opens in a new tab)</span>
                  </Button>
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      )}

      {/* Desktop Navigation Bar */}
      <div className="px-gutter hidden w-full items-center justify-between bg-transparent py-8 lg:flex">
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
              <NavLink href="/who-we-are" className="font-semibold text-[var(--text-fluid-base)]">
                About Us
              </NavLink>
            </li>
            <li>
              <NavLink href="/job-insights" className="font-semibold text-[var(--text-fluid-base)]">
                Job Insights
              </NavLink>
            </li>
            <li>
              <Link
                href="https://hr.thejobapplicantperspective.com/login"
                target="_blank"
                rel="noopener noreferrer"
                className="focus-visible:outline-none"
              >
                <Button variant="primary" size="md" className="min-h-12">
                  Sign in as employer
                  <span className="sr-only"> (opens in a new tab)</span>
                </Button>
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default MainHeader;
