'use client';

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  clearHrSession,
  fetchHrUserDetails,
  getStoredHrToken,
  getStoredHrUser,
} from '@/lib/api/hrSession';
import type { HrUser } from '@/lib/dto/hrAuth';

interface HrAuthContextValue {
  user: HrUser | null;
  token: string | null;
  isLoading: boolean;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

const HrAuthContext = createContext<HrAuthContextValue | undefined>(undefined);

const PUBLIC_HR_ROUTES = new Set(['/login', '/create-account', '/verify']);

interface HrAuthProviderProps {
  children: ReactNode;
}

export const HrAuthProvider = ({ children }: HrAuthProviderProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<HrUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const normalizedPath = pathname.startsWith('/hr') ? pathname.slice(3) || '/' : pathname;

  const logout = useCallback(() => {
    clearHrSession();
    setToken(null);
    setUser(null);
    router.replace('/login');
  }, [router]);

  const refreshProfile = useCallback(async () => {
    const storedToken = getStoredHrToken();
    if (!storedToken) {
      setToken(null);
      setUser(null);
      setIsLoading(false);
      if (!PUBLIC_HR_ROUTES.has(normalizedPath)) {
        router.replace('/login');
      }
      return;
    }

    setToken(storedToken);
    const cachedUser = getStoredHrUser();
    if (cachedUser) {
      setUser(cachedUser);
    }

    try {
      const freshUser = await fetchHrUserDetails(storedToken);
      setUser(freshUser);
      if (PUBLIC_HR_ROUTES.has(normalizedPath)) {
        router.replace('/');
      }
    } catch {
      setToken(null);
      setUser(null);
      if (!PUBLIC_HR_ROUTES.has(normalizedPath)) {
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
    <HrAuthContext.Provider value={{ user, token, isLoading, logout, refreshProfile }}>
      {children}
    </HrAuthContext.Provider>
  );
};

export const useHrAuth = (): HrAuthContextValue => {
  const context = useContext(HrAuthContext);
  if (!context) {
    throw new Error('useHrAuth must be used within an HrAuthProvider.');
  }
  return context;
};
