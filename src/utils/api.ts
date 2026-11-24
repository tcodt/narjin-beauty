import axios, { AxiosError } from "axios";
import { clearAuthTokens } from "./tokenHelper";

const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_BASE_URL ||
    "https://queuingprojectapi.pythonanywhere.com",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const status = error.response?.status;
    const url = error.config?.url ?? "";
    const data = error.response?.data as
      | { detail?: { code?: string } | string }
      | undefined;

    // اشتراک منقضی → صفحهٔ خرید پلن (نه «دسترسی ندارید»)
    if (status === 403) {
      const code =
        typeof data?.detail === "object" ? data.detail?.code : undefined;
      if (code === "subscription_required") {
        if (
          window.location.pathname !== "/plans" &&
          !window.location.pathname.startsWith("/subscription")
        ) {
          window.location.href = "/plans";
        }
        return Promise.reject(error);
      }
    }

    if (status === 401) {
      const isAuthEndpoint =
        url.includes("/login") ||
        url.includes("/register") ||
        url.includes("/token");

      if (!isAuthEndpoint) {
        clearAuthTokens();
        if (window.location.pathname !== "/login") {
          window.location.href = "/login";
        }
      }
    }

    return Promise.reject(error);
  },
);

export default api;
