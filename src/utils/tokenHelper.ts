import type { User } from "../types/users";

const ACCESS_KEY = "accessToken";
const REFRESH_KEY = "refreshToken";
const USER_KEY = "user";

export const getAccessToken = (): string | null =>
  localStorage.getItem(ACCESS_KEY);

export const getRefreshToken = (): string | null =>
  localStorage.getItem(REFRESH_KEY);

export const setAccessToken = (token: string) => {
  localStorage.setItem(ACCESS_KEY, token);
};

export const setRefreshToken = (token: string) => {
  localStorage.setItem(REFRESH_KEY, token);
};

export const storeAuthTokens = (data: {
  access: string;
  refresh: string;
  user?: unknown;
}) => {
  localStorage.setItem(ACCESS_KEY, data.access);
  localStorage.setItem(REFRESH_KEY, data.refresh);
  if (data.user !== undefined) {
    localStorage.setItem(USER_KEY, JSON.stringify(data.user));
  }
};

export const clearAuthTokens = () => {
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
  localStorage.removeItem(USER_KEY);
};

export const getUserFromStorage = (): User | null => {
  try {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
};

export const setUserInStorage = (user: User) => {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};
