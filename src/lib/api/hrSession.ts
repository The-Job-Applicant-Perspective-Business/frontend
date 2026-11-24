import { HrUserDetailsResponseSchema, HrUserSchema, type HrUser } from '@/lib/dto/hrAuth';

export const HR_TOKEN_STORAGE_KEY = 'tjap_hr_token';
export const HR_USER_STORAGE_KEY = 'tjap_hr_user';
export const HR_PROFILE_ENDPOINT = '/api/v1/auth/me';

const getApiBaseUrl = (): string =>
  (process.env.NEXT_PUBLIC_TJAP_API_URL ?? '').trim().replace(/\/+$/, '');

export const getStoredHrToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(HR_TOKEN_STORAGE_KEY);
};

export const getStoredHrUser = (): HrUser | null => {
  if (typeof window === 'undefined') return null;
  const raw = window.localStorage.getItem(HR_USER_STORAGE_KEY);
  if (!raw) return null;

  try {
    const parsed = HrUserSchema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
};

export const clearHrSession = (): void => {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(HR_TOKEN_STORAGE_KEY);
  window.localStorage.removeItem(HR_USER_STORAGE_KEY);
};

export const fetchHrUserDetails = async (token: string, signal?: AbortSignal): Promise<HrUser> => {
  const apiBaseUrl = getApiBaseUrl();

  const response = await fetch(`${apiBaseUrl}${HR_PROFILE_ENDPOINT}`, {
    method: 'GET',
    headers: {
      Accept: 'application/json, text/plain, */*',
      Authorization: `Bearer ${token}`,
    },
    signal,
  });

  if (response.status === 401 || response.status === 403) {
    clearHrSession();
    throw new Error('Session expired. Please sign in again.');
  }

  if (!response.ok) {
    throw new Error(`Failed to fetch HR user details (${response.status}).`);
  }

  const rawPayload: unknown = await response.json();
  const parsed = HrUserDetailsResponseSchema.safeParse(rawPayload);

  if (!parsed.success) {
    throw new Error('Invalid HR user profile payload received from server.');
  }

  if (typeof window !== 'undefined') {
    window.localStorage.setItem(HR_USER_STORAGE_KEY, JSON.stringify(parsed.data.data));
  }

  return parsed.data.data;
};
