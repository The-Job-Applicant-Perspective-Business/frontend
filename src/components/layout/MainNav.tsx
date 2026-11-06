'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { NavLink } from '@/components/ui/NavLink';

interface ToolItem {
  title: string;
  href: string;
  description: string;
}

const JOB_APP_TOOLS: ToolItem[] = [
  {
    title: 'Career Fairs',
    href: '/career-fairs',
    description: 'Upcoming regional and virtual candidate hiring events.',
  },
  {
    title: 'AI Tools Audit',
    href: '/ai-tools',
    description: 'Candidate-first forensic audits of algorithmic hiring platforms.',
  },
  {
    title: 'Self Care Tools',
    href: '/self-care-tools',
    description: 'Mental health, burnout recovery, and job-search resilience resources.',
  },
  {
    title: 'Financial Support',
    href: '/us-govt-financial-support',
    description: 'Unemployment navigation, relief funds, and emergency assistance.',
  },
];

export interface MainNavProps {
  className?: string;
  onItemClick?: () => void;
  isMobile?: boolean;
}

export const MainNav = ({ className = '', onItemClick, isMobile = false }: MainNavProps) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLLIElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    if (isMobile) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isDropdownOpen) {
        setIsDropdownOpen(false);
        triggerRef.current?.focus();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isDropdownOpen, isMobile]);

  const toggleDropdown = () => {
    setIsDropdownOpen((prev) => !prev);
  };

  const handleLinkClick = () => {
    setIsDropdownOpen(false);
    onItemClick?.();
  };

  if (isMobile) {
    return (
      <nav aria-label="Mobile Navigation Menu" className={`w-full ${className}`.trim()}>
        <ul className="m-0 flex list-none flex-col gap-2 p-0">
          <li>
            <NavLink
              href="/who-we-are"
              onClick={handleLinkClick}
              className="flex min-h-12 items-center text-[16px] font-semibold text-[#434343]"
            >
              About Us
            </NavLink>
          </li>
          <li>
            <NavLink
              href="/job-insights"
              onClick={handleLinkClick}
              className="flex min-h-12 items-center text-[16px] font-semibold text-[#434343]"
            >
              Job Insights
            </NavLink>
          </li>

          {/* Mobile Accordion for Job App Tools */}
          <li className="flex flex-col">
            <button
              type="button"
              onClick={toggleDropdown}
              aria-expanded={isDropdownOpen}
              aria-controls="mobile-tools-dropdown"
              className="flex min-h-12 w-full items-center justify-between text-[16px] font-semibold text-[#434343] focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
            >
              <span>Job App Tools</span>
              <ChevronDown
                className={`h-4 w-4 transition-transform duration-200 ${
                  isDropdownOpen ? 'rotate-180' : ''
                }`}
                aria-hidden="true"
              />
            </button>
            {isDropdownOpen && (
              <ul
                id="mobile-tools-dropdown"
                className="ml-4 flex list-none flex-col gap-2 border-l-2 border-gray-200 py-1 pl-3"
              >
                {JOB_APP_TOOLS.map((tool) => (
                  <li key={tool.href}>
                    <Link
                      href={tool.href}
                      onClick={handleLinkClick}
                      className="block py-2 text-[15px] font-medium text-gray-700 hover:text-blue-600 focus-visible:outline-none"
                    >
                      {tool.title}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </li>

          {/* Employer Login CTA */}
          <li className="pt-4">
            <Link
              href="https://hr.thejobapplicantperspective.com/login"
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleLinkClick}
              className="block w-full focus-visible:outline-none"
            >
              <Button variant="primary" size="md" className="min-h-12 w-full">
                Sign in as employer
                <span className="sr-only"> (opens in a new tab)</span>
              </Button>
            </Link>
          </li>
        </ul>
      </nav>
    );
  }

  // Desktop Navigation
  return (
    <nav
      aria-label="Main Desktop Navigation"
      className={`relative z-20 flex items-center ${className}`.trim()}
    >
      <ul className="m-0 flex list-none items-center gap-[32px] p-0">
        <li>
          <NavLink
            href="/who-we-are"
            className="text-[16px] font-[600] text-[#434343] transition-colors hover:text-blue-600"
          >
            About Us
          </NavLink>
        </li>

        <li>
          <NavLink
            href="/job-insights"
            className="text-[16px] font-[600] text-[#434343] transition-colors hover:text-blue-600"
          >
            Job Insights
          </NavLink>
        </li>

        {/* Desktop Job App Tools Dropdown */}
        <li className="relative" ref={dropdownRef}>
          <button
            ref={triggerRef}
            type="button"
            id="job-app-tools-trigger"
            aria-haspopup="true"
            aria-expanded={isDropdownOpen}
            aria-controls="job-app-tools-menu"
            onClick={toggleDropdown}
            className="group inline-flex h-10 items-center justify-center rounded-md py-2 text-[16px] font-[600] text-[#434343] transition-colors hover:text-blue-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
          >
            <span>Job App Tools</span>
            <ChevronDown
              className={`ml-1 h-4 w-4 transition-transform duration-200 ${
                isDropdownOpen ? 'rotate-180' : ''
              }`}
              aria-hidden="true"
            />
          </button>

          {isDropdownOpen && (
            <div
              id="job-app-tools-menu"
              role="menu"
              aria-labelledby="job-app-tools-trigger"
              className="animate-in fade-in-0 zoom-in-95 absolute top-full left-0 mt-2 w-72 rounded-lg border border-gray-100 bg-white p-2 shadow-xl ring-1 ring-black/5"
            >
              {JOB_APP_TOOLS.map((tool) => (
                <Link
                  key={tool.href}
                  href={tool.href}
                  role="menuitem"
                  onClick={handleLinkClick}
                  className="group block rounded-md p-2.5 transition-colors hover:bg-slate-50 focus:bg-slate-50 focus:outline-none"
                >
                  <span className="block text-[15px] font-semibold text-gray-900 group-hover:text-blue-600">
                    {tool.title}
                  </span>
                  <span className="mt-0.5 block text-[13px] leading-snug text-gray-500">
                    {tool.description}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </li>

        {/* Employer Action */}
        <li>
          <Link
            href="https://hr.thejobapplicantperspective.com/login"
            target="_blank"
            rel="noopener noreferrer"
            className="focus-visible:outline-none"
          >
            <Button variant="primary" size="md" className="min-h-10 px-5">
              Sign in as employer
              <span className="sr-only"> (opens in a new tab)</span>
            </Button>
          </Link>
        </li>
      </ul>
    </nav>
  );
};

export default MainNav;
