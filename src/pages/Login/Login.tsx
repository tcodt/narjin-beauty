import React, { useCallback, useId, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router";
import { FaPhoneAlt } from "react-icons/fa";
import Button from "../../components/Button/Button";
import { SubmitHandler, useForm } from "react-hook-form";
import { IoEye, IoEyeOff } from "react-icons/io5";
import { IoIosLock } from "react-icons/io";
import { useLogin } from "../../hooks/accounts/login/useLogin";
import toast from "react-hot-toast";
import { LoginType } from "../../types/login";
import { useThemeColor } from "../../context/ThemeColor";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../context/AuthContext";
import { useUserType } from "../../context/UserTypeContext";
import { parseApiError } from "../../utils/parseApiError";
import { useRateLimitGuard } from "../../hooks/useRateLimitGuard";

/* -------------------------------------------------------------------------- */
/* Theme color → safe class strings (Tailwind can see these literally)        */
/* -------------------------------------------------------------------------- */

const ACCENT_CLASSES = {
  green: {
    text: "text-emerald-500 dark:text-emerald-400",
    ring: "focus:ring-emerald-500/30",
    hover: "hover:text-emerald-600 dark:hover:text-emerald-300",
    bg: "bg-emerald-500",
  },
  blue: {
    text: "text-blue-500 dark:text-blue-400",
    ring: "focus:ring-blue-500/30",
    hover: "hover:text-blue-600 dark:hover:text-blue-300",
    bg: "bg-blue-500",
  },
  purple: {
    text: "text-violet-500 dark:text-violet-400",
    ring: "focus:ring-violet-500/30",
    hover: "hover:text-violet-600 dark:hover:text-violet-300",
    bg: "bg-violet-500",
  },
  red: {
    text: "text-red-500 dark:text-red-400",
    ring: "focus:ring-red-500/30",
    hover: "hover:text-red-600 dark:hover:text-red-300",
    bg: "bg-red-500",
  },
} as const;

function useAccent(themeColor: string) {
  return useMemo(() => {
    const key = (
      themeColor in ACCENT_CLASSES ? themeColor : "green"
    ) as keyof typeof ACCENT_CLASSES;
    return ACCENT_CLASSES[key];
  }, [themeColor]);
}

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

/* -------------------------------------------------------------------------- */
/* Error outline helper                                                       */
/* -------------------------------------------------------------------------- */

const inputErrorClass = (hasError: boolean) =>
  hasError
    ? "outline outline-1 outline-red-400 dark:outline-red-500 focus:outline-red-500"
    : "";

/* -------------------------------------------------------------------------- */
/* Page                                                                       */
/* -------------------------------------------------------------------------- */

const Login: React.FC = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginType>({
    mode: "onBlur",
  });
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();
  const loginMutation = useLogin();
  const { themeColor } = useThemeColor();
  const queryClient = useQueryClient();
  const { login: loginContext } = useAuth();
  const { setUserType } = useUserType();
  const rateLimit = useRateLimitGuard();

  const accent = useAccent(themeColor);

  const phoneId = useId();
  const phoneErrorId = useId();
  const passwordId = useId();
  const passwordErrorId = useId();

  const toggle = useCallback(() => {
    setIsVisible((prev) => !prev);
  }, []);

  const handleLogin: SubmitHandler<LoginType> = (data) => {
    if (rateLimit.isLimited) return;

    const toastId = toast.loading("در حال ورود...");

    loginMutation.mutate(data, {
      onSuccess: async (res) => {
        toast.success("ورود موفقیت‌آمیز بود!", { id: toastId });
        queryClient.setQueryData(["userProfile"], res.user);
        loginContext({ access: res.access, refresh: res.refresh }, res.user);

        const isOwner = !!res.user?.is_owner;
        const joined = localStorage.getItem("joinedBusiness");

        if (isOwner) {
          setUserType("owner");
          navigate("/dashboard", { replace: true });
          return;
        }

        setUserType("customer");
        navigate(joined ? "/home" : "/join-salon", { replace: true });
      },
      onError: (error) => {
        rateLimit.triggerFromError(error);
        toast.error(parseApiError(error), { id: toastId });
      },
    });
  };

  const isLoading = loginMutation.isPending;
  const isRateLimited = rateLimit.isLimited;
  const submitDisabled = isLoading || isRateLimited;

  const submitLabel = isRateLimited
    ? `لطفاً ${rateLimit.secondsLeft} ثانیه صبر کنید`
    : isLoading
      ? "در حال ورود..."
      : "ورود به حساب";

  return (
    <section
      dir="rtl"
      className="min-h-screen w-full overflow-y-auto bg-gray-50 dark:bg-gray-900"
    >
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-4 py-8 sm:px-6">
        {/* Header */}
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 rounded-full bg-white p-2 shadow-md dark:bg-gray-800">
            <img
              src="/images/logo-main.png"
              alt="لوگو"
              className="h-20 w-20 rounded-full border border-primary-green-500 object-contain"
            />
          </div>
          <h1 className={`text-2xl font-bold sm:text-3xl ${accent.text}`}>
            خوش آمدید
          </h1>
          <p className="mt-2 max-w-sm text-sm leading-6 text-gray-500 dark:text-gray-300">
            وارد حساب خود شوید تا نوبت رزرو کنید و از خدمات سالن استفاده کنید.
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-lg dark:border-gray-700 dark:bg-gray-800 sm:p-8">
          <form
            onSubmit={handleSubmit(handleLogin)}
            className="flex flex-col gap-5"
            noValidate
            aria-busy={isLoading}
          >
            {/* Phone */}
            <div className="space-y-1.5">
              <label
                htmlFor={phoneId}
                className="block text-sm font-medium text-gray-700 dark:text-gray-200"
              >
                شماره تلفن
              </label>
              <div className="relative">
                <input
                  id={phoneId}
                  type="tel"
                  inputMode="numeric"
                  maxLength={11}
                  autoComplete="username"
                  placeholder="09123456789"
                  aria-invalid={!!errors.phone_number}
                  aria-describedby={
                    errors.phone_number ? phoneErrorId : undefined
                  }
                  className={`primary-input pl-10 ${inputErrorClass(
                    !!errors.phone_number,
                  )}`}
                  {...register("phone_number", {
                    required: "شماره تلفن الزامی است",
                    pattern: {
                      value: /^09[0-9]{9}$/,
                      message: "شماره باید ۱۱ رقم و با ۰۹ شروع شود",
                    },
                    setValueAs: normalizePhoneInput,
                  })}
                />
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">
                  <FaPhoneAlt aria-hidden="true" />
                </span>
              </div>
              {errors.phone_number && (
                <p
                  id={phoneErrorId}
                  className="text-sm text-red-500 dark:text-red-400"
                  role="alert"
                >
                  {errors.phone_number.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor={passwordId}
                  className="block text-sm font-medium text-gray-700 dark:text-gray-200"
                >
                  رمز عبور
                </label>
                <Link
                  to="/forgot-password"
                  className={`rounded text-xs font-medium ${accent.text} ${accent.hover} underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 dark:focus-visible:ring-gray-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-gray-800`}
                >
                  فراموشی رمز؟
                </Link>
              </div>
              <div className="relative">
                <input
                  id={passwordId}
                  type={isVisible ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="حداقل ۶ کاراکتر"
                  aria-invalid={!!errors.password}
                  aria-describedby={
                    errors.password ? passwordErrorId : undefined
                  }
                  className={`primary-input px-10 text-left ${inputErrorClass(
                    !!errors.password,
                  )}`}
                  {...register("password", {
                    required: "رمز عبور الزامی است",
                    minLength: {
                      value: 6,
                      message: "رمز عبور باید حداقل ۶ کاراکتر باشد",
                    },
                  })}
                />
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">
                  <IoIosLock size={18} aria-hidden="true" />
                </span>
                <button
                  type="button"
                  onClick={toggle}
                  aria-label={isVisible ? "مخفی کردن رمز" : "نمایش رمز"}
                  aria-pressed={isVisible}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 text-gray-400 transition-colors hover:text-gray-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 dark:text-gray-500 dark:hover:text-gray-200 dark:focus-visible:ring-gray-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-gray-800"
                >
                  {isVisible ? (
                    <IoEyeOff size={18} aria-hidden="true" />
                  ) : (
                    <IoEye size={18} aria-hidden="true" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p
                  id={passwordErrorId}
                  className="text-sm text-red-500 dark:text-red-400"
                  role="alert"
                >
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Submit */}
            <Button
              type="submit"
              disabled={submitDisabled}
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
                تعداد درخواست‌ها زیاد است. پس از پایان شمارش می‌توانید دوباره
                تلاش کنید.
              </p>
            )}
          </form>

          {/* Divider */}
          <div className="mt-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-gray-200 dark:bg-gray-600" />
            <span className="text-xs text-gray-400 dark:text-gray-500">یا</span>
            <div className="h-px flex-1 bg-gray-200 dark:bg-gray-600" />
          </div>

          {/* Register */}
          <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-300">
            حساب کاربری ندارید؟{" "}
            <Link
              to="/register"
              className={`rounded font-semibold ${accent.text} ${accent.hover} underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 dark:focus-visible:ring-gray-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-gray-800`}
            >
              ثبت‌نام کنید
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
};

export default Login;
