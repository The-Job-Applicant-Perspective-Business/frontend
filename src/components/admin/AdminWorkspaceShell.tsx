'use client';

import { useEffect, useState, type ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Bell,
  Briefcase,
  Building2,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquareText,
  User,
  Users,
  X,
} from 'lucide-react';
import { useAdminAuth } from './AdminAuthProvider';
import { getAdminApiBaseUrl, getStoredAdminToken } from '@/lib/api/adminSession';

interface AdminWorkspaceShellProps {
  pageTitle: string;
  children: ReactNode;
}

interface AdminNavItem {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  matchPrefix?: boolean;
}

const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/classified', label: 'Classified jobs', icon: Briefcase, matchPrefix: true },
  { href: '/hr-management', label: 'HR management', icon: Users, matchPrefix: true },
  { href: '/reviews', label: 'Reviews', icon: MessageSquareText, matchPrefix: true },
  {
    href: '/reviews/reviewed-companies',
    label: 'Reviewed companies',
    icon: Building2,
    matchPrefix: true,
  },
];

export const AdminWorkspaceShell = ({ pageTitle, children }: AdminWorkspaceShellProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoading: isAuthLoading, logout } = useAdminAuth();

  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const normalizedPath = pathname.startsWith('/admin') ? pathname.slice(6) || '/' : pathname;

  useEffect(() => {
    if (isAuthLoading) return;
    const storedToken = getStoredAdminToken();
    if (!user && !storedToken) {
      router.replace('/login');
    }
  }, [isAuthLoading, user, router]);

  useEffect(() => {
    const token = getStoredAdminToken();
    if (!token) return;

    const loadUnreadCount = async () => {
      try {
        const apiBaseUrl = getAdminApiBaseUrl();
        const response = await fetch(`${apiBaseUrl}/api/v1/notifications/unread-count`, {
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) return;
        const payload = (await response.json().catch(() => null)) as {
          data?: number | { count?: number };
        } | null;
        if (typeof payload?.data === 'number') {
          setUnreadCount(payload.data);
        } else if (payload?.data && typeof payload.data.count === 'number') {
          setUnreadCount(payload.data.count);
        }
      } catch {
        // Non-blocking notification counter
      }
    };

    void loadUnreadCount();
  }, []);

  const isNavItemActive = (item: AdminNavItem): boolean => {
    if (item.href === '/') {
      return normalizedPath === '/';
    }
    if (item.href === '/reviews') {
      return normalizedPath === '/reviews';
    }
    return item.matchPrefix
      ? normalizedPath === item.href || normalizedPath.startsWith(`${item.href}/`)
      : normalizedPath === item.href;
  };

  if (isAuthLoading) {
    return (
      <main
        id="main-content"
        className="flex min-h-screen w-full items-center justify-center bg-[#F8FAFC] p-6"
      >
        <p role="status" className="text-base font-semibold text-[#0D3276]">
          Verifying Admin session...
        </p>
      </main>
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-white lg:flex-row">
      {/* Desktop Sidebar */}
      <aside
        aria-label="Admin Portal Navigation"
        className="hidden h-screen w-[270px] shrink-0 flex-col border-r border-[#E7EBF1] bg-white shadow-[0_19px_40px_rgba(143,143,143,0.12)] lg:sticky lg:top-0 lg:flex"
      >
        <div className="mt-10 flex w-full justify-center px-6">
          <Link
            href="/"
            className="inline-flex items-center rounded-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0D3276]"
          >
            <Image
              src="/logosm.svg"
              alt="The Job Applicant Perspective Admin"
              width={180}
              height={32}
              priority
              className="h-auto w-[180px]"
            />
          </Link>
        </div>

        <nav
          aria-label="Primary Admin Workspace"
          className="mt-14 flex w-full flex-col items-end gap-2"
        >
          {ADMIN_NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = isNavItemActive(item);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={`flex w-[238px] items-center gap-3 rounded-l-lg py-3 pl-5 text-base font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0D3276] ${
                  active
                    ? 'bg-[#0D3276] text-white'
                    : 'text-[#434343] hover:bg-[#F1F5F9] hover:text-[#0D3276]'
                }`}
              >
                <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Mobile Navigation Drawer */}
      {mobileNavOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Admin Navigation Menu"
          className="fixed inset-0 z-50 flex bg-black/40 lg:hidden"
        >
          <div className="flex h-full w-72 flex-col bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <Image
                src="/logosm.svg"
                alt="The Job Applicant Perspective Admin"
                width={168}
                height={30}
                className="h-auto w-[168px]"
              />
              <button
                type="button"
                onClick={() => setMobileNavOpen(false)}
                aria-label="Close navigation menu"
                className="rounded-md p-2 text-[#434343] hover:bg-[#F1F5F9] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0D3276]"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            <nav aria-label="Mobile Admin Workspace" className="mt-8 flex flex-col gap-2">
              {ADMIN_NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const active = isNavItemActive(item);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={active ? 'page' : undefined}
                    onClick={() => setMobileNavOpen(false)}
                    className={`flex items-center gap-3 rounded-lg px-4 py-3 text-base font-semibold ${
                      active
                        ? 'bg-[#0D3276] text-white'
                        : 'text-[#434343] hover:bg-[#F1F5F9] hover:text-[#0D3276]'
                    }`}
                  >
                    <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            <button
              type="button"
              onClick={() => void logout()}
              className="mt-auto flex items-center gap-3 rounded-lg border border-[#D0D9E9] px-4 py-3 text-base font-semibold text-[#B91C1C] hover:bg-red-50"
            >
              <LogOut className="h-5 w-5" aria-hidden="true" />
              <span>Sign out</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Content Shell */}
      <div className="flex w-full min-w-0 flex-col px-4 md:px-8">
        {/* Mobile Header */}
        <header className="flex items-center justify-between py-6 lg:hidden">
          <p className="text-xl font-bold text-[#121212]">{pageTitle}</p>
          <button
            type="button"
            onClick={() => setMobileNavOpen(true)}
            aria-label="Open navigation menu"
            aria-expanded={mobileNavOpen}
            className="rounded-lg border border-[#D0D9E9] p-2.5 text-[#0D3276] hover:bg-[#F1F5F9] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0D3276]"
          >
            <Menu className="h-6 w-6" aria-hidden="true" />
          </button>
        </header>

        {/* Desktop Top Bar */}
        <header className="mt-7 hidden w-full items-center justify-between border-b border-[#E7EBF1] pb-4 lg:flex">
          <h1 className="text-2xl font-bold text-[#121212]">{pageTitle}</h1>

          <div className="flex items-center gap-4">
            <button
              type="button"
              aria-label={
                unreadCount > 0 ? `Notifications (${unreadCount} unread)` : 'Notifications'
              }
              className="relative rounded-lg p-2 text-[#434343] hover:bg-[#F1F5F9] hover:text-[#0D3276] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0D3276]"
            >
              <Bell className="h-5 w-5" aria-hidden="true" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#0D3276] px-1 text-[10px] font-bold text-white">
                  {unreadCount}
                </span>
              )}
            </button>

            <span aria-hidden="true" className="text-2xl text-[#D9D9D9]">
              |
            </span>

            <div className="relative">
              <button
                type="button"
                onClick={() => setUserMenuOpen((prev) => !prev)}
                aria-expanded={userMenuOpen}
                aria-haspopup="menu"
                className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-base font-bold text-[#374151] hover:bg-[#F1F5F9] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0D3276]"
              >
                <User className="h-4 w-4 text-[#0D3276]" aria-hidden="true" />
                <span>{user?.name ?? user?.email ?? 'Administrator'}</span>
              </button>

              {userMenuOpen && (
                <div
                  role="menu"
                  className="absolute right-0 z-30 mt-2 w-48 rounded-lg border border-[#D0D9E9] bg-white py-1.5 shadow-lg"
                >
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => void logout()}
                    className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm font-semibold text-[#B91C1C] hover:bg-red-50"
                  >
                    <LogOut className="h-4 w-4" aria-hidden="true" />
                    <span>Sign out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Primary Landmark */}
        <main
          id="main-content"
          tabIndex={-1}
          className="w-full flex-grow border-t border-[#E7EBF1] pt-5 pb-12 focus:outline-none md:mt-5 md:border-t-0 md:pt-0"
        >
          <h1 className="sr-only lg:hidden">{pageTitle}</h1>
          {children}
        </main>
      </div>
    </div>
  );
};
