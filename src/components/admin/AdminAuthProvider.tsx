'use client';

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  clearAdminSession,
  fetchAdminUserDetails,
  getStoredAdminToken,
  getStoredAdminUser,
  logoutAdminSession,
} from '@/lib/api/adminSession';
import type { AdminUser } from '@/lib/dto/adminPortal';

interface AdminAuthContextValue {
  user: AdminUser | null;
  token: string | null;
  isLoading: boolean;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextValue | undefined>(undefined);

const PUBLIC_ADMIN_ROUTES = new Set(['/login', '/verify']);

interface AdminAuthProviderProps {
  children: ReactNode;
}

export const AdminAuthProvider = ({ children }: AdminAuthProviderProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const normalizedPath = pathname.startsWith('/admin') ? pathname.slice(6) || '/' : pathname;

  const logout = useCallback(async () => {
    const activeToken = getStoredAdminToken();
    await logoutAdminSession(activeToken);
    setToken(null);
    setUser(null);
    router.replace('/login');
  }, [router]);

  const refreshProfile = useCallback(async () => {
    const storedToken = getStoredAdminToken();
    if (!storedToken) {
      setToken(null);
      setUser(null);
      setIsLoading(false);
      if (!PUBLIC_ADMIN_ROUTES.has(normalizedPath)) {
        router.replace('/login');
      }
      return;
    }

    setToken(storedToken);
    const cachedUser = getStoredAdminUser();
    if (cachedUser) {
      setUser(cachedUser);
    }

    try {
      const freshUser = await fetchAdminUserDetails(storedToken);
      setUser(freshUser);
      if (PUBLIC_ADMIN_ROUTES.has(normalizedPath)) {
        router.replace('/');
      }
    } catch {
      clearAdminSession();
      setToken(null);
      setUser(null);
      if (!PUBLIC_ADMIN_ROUTES.has(normalizedPath)) {
        router.replace('/login');
      }
    } finally {
      setIsLoading(false);
    }
  }, [normalizedPath, router]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void refreshProfile();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [refreshProfile]);

  return (
    <AdminAuthContext.Provider value={{ user, token, isLoading, logout, refreshProfile }}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = (): AdminAuthContextValue => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider.');
  }
  return context;
};
