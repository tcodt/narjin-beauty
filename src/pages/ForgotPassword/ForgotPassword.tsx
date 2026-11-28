// src/pages/ForgotPassword/ForgotPassword.tsx
import React, { useCallback, useId, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router";
import { TbPasswordFingerprint } from "react-icons/tb";
import { LuArrowRight, LuPhone } from "react-icons/lu";
import toast from "react-hot-toast";

import Button from "../../components/Button/Button";
import PageBar from "../../components/PageBar/PageBar";
import { useThemeColor } from "../../context/ThemeColor";
import { themeText, themeBgSoft } from "../../utils/themeClasses";
import { useSendResetCode } from "../../hooks/accounts/send-reset-code/useSendResetCode";
import { parseApiError } from "../../utils/parseApiError";
import { useRateLimitGuard } from "../../hooks/useRateLimitGuard";

/* -------------------------------------------------------------------------- */
/* Phone normalization (paste + Persian keyboard friendly)                    */
/* -------------------------------------------------------------------------- */

const PERSIAN_DIGITS: Record<string, string> = {
  "۰": "0",
  "۱": "1",
  "۲": "2",
  "۳": "3",
  "۴": "4",
  "۵": "5",
  "۶": "6",
  "۷": "7",
  "۸": "8",
  "۹": "9",
  "٠": "0",
  "١": "1",
  "٢": "2",
  "٣": "3",
  "٤": "4",
  "٥": "5",
  "٦": "6",
  "٧": "7",
  "٨": "8",
  "٩": "9",
};

function normalizePhoneInput(raw: string): string {
  const latin = raw.replace(/[۰-۹٠-٩]/g, (d) => PERSIAN_DIGITS[d] ?? d);
  return latin.replace(/\D/g, "").slice(0, 11);
}

const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  const { themeColor } = useThemeColor();
  const [phoneNumber, setPhoneNumber] = useState("");
  const sendResetCodeMutation = useSendResetCode();
  const rateLimit = useRateLimitGuard();

  const phoneId = useId();
  const phoneErrorId = useId();

  const isPhoneValid = phoneNumber.length === 11;
  const isPhonePartial = phoneNumber.length > 0 && !isPhoneValid;

  const isLoading = sendResetCodeMutation.isPending;
  const isRateLimited = rateLimit.isLimited;

  const canSubmit = isPhoneValid && !isLoading && !isRateLimited;

  const submitLabel = useMemo(() => {
    if (isRateLimited) return `لطفاً ${rateLimit.secondsLeft} ثانیه صبر کنید`;
    if (isLoading) return "در حال ارسال...";
    return "ارسال کد تأیید";
  }, [isRateLimited, isLoading, rateLimit.secondsLeft]);

  const handlePhoneChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setPhoneNumber(normalizePhoneInput(e.target.value));
    },
    [],
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isRateLimited) return;

    if (!isPhoneValid) {
      toast.error("شماره موبایل باید ۱۱ رقم باشد");
      return;
    }

    sendResetCodeMutation.mutate(phoneNumber, {
      onSuccess: () => {
        toast.success("کد تأیید ارسال شد");
        navigate("/receive-code", { state: { phoneNumber } });
      },
      onError: (error: unknown) => {
        rateLimit.triggerFromError(error);
        toast.error(parseApiError(error) || "ارسال کد ناموفق بود");
      },
    });
  };

  return (
    <section
      dir="rtl"
      className="mx-auto flex min-h-screen w-full max-w-md flex-col bg-gray-50 p-4 dark:bg-gray-900"
    >
      <PageBar title="بازنشانی رمز عبور" handleClick={() => navigate(-1)} />

      {/* Card */}
      <div className="mt-6 flex flex-1 flex-col">
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-lg dark:border-gray-700 dark:bg-gray-800">
          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-6"
            noValidate
            aria-busy={isLoading}
          >
            {/* Header */}
            <div className="flex flex-col items-center gap-3 text-center">
              <div
                className={`flex h-16 w-16 items-center justify-center rounded-2xl ${themeBgSoft[themeColor]}`}
              >
                <TbPasswordFingerprint
                  size={36}
                  className={themeText[themeColor]}
                  aria-hidden="true"
                />
              </div>
              <h1 className="text-lg font-bold text-gray-900 dark:text-white">
                فراموشی رمز عبور
              </h1>
              <p className="max-w-xs text-sm leading-6 text-gray-500 dark:text-gray-400">
                شماره موبایلی که با آن ثبت‌نام کرده‌اید را وارد کنید تا کد
                بازیابی برایتان ارسال شود.
              </p>
            </div>

            {/* Phone input */}
            <div className="space-y-1.5">
              <label
                htmlFor={phoneId}
                className="block text-sm font-medium text-gray-700 dark:text-gray-200"
              >
                شماره موبایل
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-400 dark:text-gray-500">
                  <LuPhone size={18} aria-hidden="true" />
                </span>
                <input
                  id={phoneId}
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel"
                  dir="ltr"
                  placeholder="09xxxxxxxxx"
                  value={phoneNumber}
                  onChange={handlePhoneChange}
                  maxLength={11}
                  disabled={isRateLimited || isLoading}
                  aria-invalid={isPhonePartial}
                  aria-describedby={isPhonePartial ? phoneErrorId : undefined}
                  className={`primary-input w-full pr-10 text-left tracking-wider ${
                    isPhonePartial
                      ? "outline-1 outline-red-400 dark:outline-red-500 focus:outline-red-500"
                      : ""
                  }`}
                />
              </div>
              {/* Reserved error row — no layout shift when counter appears */}
              <div className="min-h-4">
                {isPhonePartial && (
                  <p
                    id={phoneErrorId}
                    className="text-xs text-rose-600 dark:text-rose-400"
                    role="alert"
                  >
                    شماره باید ۱۱ رقم باشد ({phoneNumber.length}/۱۱)
                  </p>
                )}
              </div>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              disabled={!canSubmit}
              className="h-11 w-full active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 motion-reduce:transform-none"
              aria-live="polite"
            >
              {submitLabel}
            </Button>

            {isRateLimited && (
              <p
                className="text-center text-sm text-amber-600 dark:text-amber-400"
                role="status"
              >
                تعداد درخواست‌ها زیاد است. پس از پایان شمارش دوباره تلاش کنید.
              </p>
            )}
          </form>
        </div>

        {/* Back link */}
        <div className="mt-auto flex flex-col items-center gap-3 pt-8">
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 rounded text-sm font-medium text-gray-500 transition-colors hover:text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-50 dark:text-gray-400 dark:hover:text-gray-200 dark:focus-visible:ring-gray-500 dark:focus-visible:ring-offset-gray-900"
          >
            <LuArrowRight size={16} aria-hidden="true" />
            بازگشت به ورود
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ForgotPassword;
