'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { MainNav } from '@/components/layout/MainNav';

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
      {/* Mobile Bar */}
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

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div
          id="mobile-navigation-menu"
          role="dialog"
          aria-modal="true"
          aria-label="Mobile Navigation"
          className="border-border bg-background px-gutter border-b py-6 shadow-lg lg:hidden"
        >
          <MainNav isMobile onItemClick={closeMobileMenu} />
        </div>
      )}

      {/* Desktop Bar */}
      <div className="px-gutter hidden w-full items-center justify-between bg-transparent py-8 lg:flex">
        <Link
          href="/"
          aria-label="Return to Homepage"
          className="focus-visible:ring-focus-ring focus-visible:ring-offset-background rounded-md focus-visible:ring-3 focus-visible:ring-offset-2 focus-visible:outline-none"
        >
          <Image src={logoSrc} alt="TJAP Logo" width={247} height={41} priority />
        </Link>
        <MainNav />
      </div>
    </header>
  );
};

export default MainHeader;
