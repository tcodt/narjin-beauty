import { AxiosError } from "axios";

type ErrorBody =
  | { detail?: string }
  | { error?: string }
  | { non_field_errors?: string[] }
  | Record<string, string[] | string>
  | string;

export function parseApiError(error: unknown): string {
  if (!error || typeof error !== "object") {
    return "خطای ناشناخته رخ داد.";
  }

  const axiosError = error as AxiosError<ErrorBody>;
  const status = axiosError.response?.status;
  const data = axiosError.response?.data;

  if (status === 429) {
    const retryAfter = axiosError.response?.headers?.["retry-after"];
    return retryAfter
      ? `تعداد درخواست‌ها زیاد است. ${retryAfter} ثانیه صبر کنید.`
      : "کمی صبر کنید و دوباره تلاش کنید.";
  }

  if (status === 401) {
    return "نشست شما منقضی شده. دوباره وارد شوید.";
  }

  if (status === 403) {
    if (typeof data === "object" && data && "detail" in data && data.detail) {
      return String(data.detail);
    }
    return "دسترسی ندارید.";
  }

  if (status === 404) {
    return "مورد درخواستی یافت نشد.";
  }

  if (status === 405) {
    return "این عملیات مجاز نیست.";
  }

  if (!data) return "خطا در ارتباط با سرور.";

  if (typeof data === "string") return data;

  if ("detail" in data && data.detail) return String(data.detail);
  if ("error" in data && data.error) return String(data.error);

  if ("non_field_errors" in data && Array.isArray(data.non_field_errors)) {
    return data.non_field_errors.join("، ");
  }

  // field errors: { phone_number: ["..."], ... }
  const fieldMessages: string[] = [];
  for (const [key, value] of Object.entries(data)) {
    if (key === "detail" || key === "error" || key === "non_field_errors")
      continue;
    if (Array.isArray(value)) {
      fieldMessages.push(...value.map(String));
    } else if (typeof value === "string") {
      fieldMessages.push(value);
    }
  }

  if (fieldMessages.length) return fieldMessages.join("، ");

  return "خطایی رخ داد. لطفاً دوباره تلاش کنید.";
}
