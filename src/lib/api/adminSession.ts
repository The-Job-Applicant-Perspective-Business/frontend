import { AdminMeResponseSchema, AdminUserSchema, type AdminUser } from '@/lib/dto/adminPortal';

export const ADMIN_TOKEN_STORAGE_KEY = 'tjap_admin_token';
export const ADMIN_USER_STORAGE_KEY = 'tjap_admin_user';
export const ADMIN_PROFILE_ENDPOINT = '/api/v1/auth/me';
export const ADMIN_LOGOUT_ENDPOINT = '/api/v1/auth/logout';

export const getAdminApiBaseUrl = (): string =>
  (process.env.NEXT_PUBLIC_TJAP_API_URL ?? '').trim().replace(/\/+$/, '');

export const getStoredAdminToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(ADMIN_TOKEN_STORAGE_KEY);
};

export const getStoredAdminUser = (): AdminUser | null => {
  if (typeof window === 'undefined') return null;
  const raw = window.localStorage.getItem(ADMIN_USER_STORAGE_KEY);
  if (!raw) return null;

  try {
    const parsed = AdminUserSchema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
};

export const persistAdminSession = (token: string, user: AdminUser): void => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(ADMIN_TOKEN_STORAGE_KEY, token);
  window.localStorage.setItem(ADMIN_USER_STORAGE_KEY, JSON.stringify(user));
};

export const clearAdminSession = (): void => {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(ADMIN_TOKEN_STORAGE_KEY);
  window.localStorage.removeItem(ADMIN_USER_STORAGE_KEY);
};

export const fetchAdminUserDetails = async (
  token: string,
  signal?: AbortSignal,
): Promise<AdminUser> => {
  const apiBaseUrl = getAdminApiBaseUrl();

  const response = await fetch(`${apiBaseUrl}${ADMIN_PROFILE_ENDPOINT}`, {
    method: 'GET',
    headers: {
      Accept: 'application/json, text/plain, */*',
      Authorization: `Bearer ${token}`,
    },
    signal,
  });

  if (response.status === 401 || response.status === 403) {
    clearAdminSession();
    throw new Error('Admin session expired. Please sign in again.');
  }

  if (!response.ok) {
    throw new Error(`Failed to fetch Admin user details (${response.status}).`);
  }

  const rawPayload: unknown = await response.json();
  const parsed = AdminMeResponseSchema.safeParse(rawPayload);

  if (!parsed.success) {
    clearAdminSession();
    throw new Error('Invalid Admin user profile payload received from server.');
  }

  if (typeof window !== 'undefined') {
    window.localStorage.setItem(ADMIN_USER_STORAGE_KEY, JSON.stringify(parsed.data.data));
  }

  return parsed.data.data;
};

export const logoutAdminSession = async (token: string | null): Promise<void> => {
  const apiBaseUrl = getAdminApiBaseUrl();
  try {
    if (token) {
      await fetch(`${apiBaseUrl}${ADMIN_LOGOUT_ENDPOINT}`, {
        method: 'DELETE',
        headers: {
          Accept: 'application/json, text/plain, */*',
          Authorization: `Bearer ${token}`,
        },
      });
    }
  } finally {
    clearAdminSession();
  }
};
