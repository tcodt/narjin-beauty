import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  InternalAxiosRequestConfig,
} from "axios";
import {
  clearAuthTokens,
  getAccessToken,
  getRefreshToken,
  setAccessToken,
} from "./tokenHelper";

/** مسیر رفرش — در صورت تفاوت با بک‌اند فقط همین را عوض کنید */
const REFRESH_URL =
  import.meta.env.VITE_TOKEN_REFRESH_URL || "/accounts/token/refresh/";

const api: AxiosInstance = axios.create({
  baseURL:
    import.meta.env.VITE_API_BASE_URL ||
    "https://queuingprojectapi.pythonanywhere.com",
  timeout: 30_000,
});

/* -------------------------------------------------------------------------- */
/* Request: Bearer token                                                      */
/* -------------------------------------------------------------------------- */

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getAccessToken();
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/* -------------------------------------------------------------------------- */
/* Refresh queue (جلوگیری از چند رفرش هم‌زمان)                               */
/* -------------------------------------------------------------------------- */

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string | null) => void;
  reject: (err: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((p) => {
    if (error) p.reject(error);
    else p.resolve(token);
  });
  failedQueue = [];
};

const isAuthUrl = (url?: string) => {
  if (!url) return false;
  return (
    url.includes("/login") ||
    url.includes("/register") ||
    url.includes("/token") ||
    url.includes(REFRESH_URL)
  );
};

const isSubscriptionAllowedPath = () => {
  const path = window.location.pathname;
  return (
    path === "/plans" ||
    path.startsWith("/subscription") ||
    path === "/login" ||
    path === "/auth" ||
    path === "/logout"
  );
};

type DetailShape =
  | string
  | { code?: string; message?: string; detail?: string }
  | undefined;

const getErrorCode = (data: unknown): string | undefined => {
  if (!data || typeof data !== "object") return undefined;
  const d = data as { detail?: DetailShape; code?: string };
  if (typeof d.code === "string") return d.code;
  if (d.detail && typeof d.detail === "object" && d.detail !== null) {
    return (d.detail as { code?: string }).code;
  }
  return undefined;
};

/* -------------------------------------------------------------------------- */
/* Response interceptor                                                       */
/* -------------------------------------------------------------------------- */

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalConfig = error.config as
      | (AxiosRequestConfig & { _retry?: boolean })
      | undefined;

    const status = error.response?.status;
    const url = originalConfig?.url ?? "";
    const data = error.response?.data;

    /* ---------- 403: subscription_required ---------- */
    if (status === 403) {
      const code = getErrorCode(data);
      if (code === "subscription_required") {
        if (!isSubscriptionAllowedPath()) {
          // full navigation تا state اپ ریست شود و access دوباره fetch شود
          window.location.assign("/plans");
        }
        return Promise.reject(error);
      }
    }

    /* ---------- 401: try refresh once ---------- */
    if (status === 401 && originalConfig && !originalConfig._retry) {
      if (isAuthUrl(url)) {
        return Promise.reject(error);
      }

      const refresh = getRefreshToken();
      if (!refresh) {
        clearAuthTokens();
        if (window.location.pathname !== "/login") {
          window.location.assign("/login");
        }
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (token: string | null) => {
              if (!token) {
                reject(error);
                return;
              }
              if (originalConfig.headers) {
                originalConfig.headers.Authorization = `Bearer ${token}`;
              }
              resolve(api(originalConfig));
            },
            reject,
          });
        });
      }

      originalConfig._retry = true;
      isRefreshing = true;

      try {
        // درخواست رفرش بدون interceptor توکن قدیمی (instance جدا یا header خالی)
        const { data: refreshData } = await axios.post(
          `${api.defaults.baseURL}${REFRESH_URL}`,
          { refresh },
          { headers: { "Content-Type": "application/json" } },
        );

        const newAccess: string | undefined =
          refreshData?.access ?? refreshData?.access_token;

        if (!newAccess) {
          throw new Error("No access token in refresh response");
        }

        setAccessToken(newAccess);
        // اگر بک‌اند refresh جدید هم برگرداند:
        if (refreshData?.refresh) {
          localStorage.setItem("refreshToken", refreshData.refresh);
        }

        processQueue(null, newAccess);

        if (originalConfig.headers) {
          originalConfig.headers.Authorization = `Bearer ${newAccess}`;
        }
        return api(originalConfig);
      } catch (refreshError) {
        processQueue(refreshError, null);
        clearAuthTokens();
        if (window.location.pathname !== "/login") {
          window.location.assign("/login");
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export default api;
