import { AxiosError } from "axios";

/**
 * Extract Retry-After seconds from a 429 response.
 * Falls back to 60 when header is missing/invalid.
 */
export function getRetryAfterSeconds(error: unknown, fallback = 60): number {
  if (!error || typeof error !== "object") return fallback;

  const axiosError = error as AxiosError;
  if (axiosError.response?.status !== 429) return 0;

  const header =
    axiosError.response.headers?.["retry-after"] ??
    axiosError.response.headers?.["Retry-After"];

  const parsed = header != null ? Number(header) : NaN;
  if (Number.isFinite(parsed) && parsed > 0) {
    return Math.ceil(parsed);
  }

  return fallback;
}

export function isRateLimited(error: unknown): boolean {
  const axiosError = error as AxiosError | undefined;
  return axiosError?.response?.status === 429;
}
