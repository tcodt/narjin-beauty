import React, { useCallback, useId, useMemo, useState } from "react";
import { FaPhoneAlt, FaUser } from "react-icons/fa";
import { IoIosLock } from "react-icons/io";
import { IoEye, IoEyeOff } from "react-icons/io5";
import { Link } from "react-router";
import Button from "../../components/Button/Button";
import { useForm, SubmitHandler } from "react-hook-form";
import { useRegister } from "../../hooks/accounts/register/useRegister";
import { RegisterType } from "../../types/register";
import { useThemeColor } from "../../context/ThemeColor";
import { useRateLimitGuard } from "../../hooks/useRateLimitGuard";

/* -------------------------------------------------------------------------- */
/* Theme color → safe class strings (Tailwind can see these literally)        */
/* -------------------------------------------------------------------------- */

const ACCENT_CLASSES = {
  green: {
    text: "text-emerald-500 dark:text-emerald-400",
    hover: "hover:text-emerald-600 dark:hover:text-emerald-300",
  },
  blue: {
    text: "text-blue-500 dark:text-blue-400",
    hover: "hover:text-blue-600 dark:hover:text-blue-300",
  },
  purple: {
    text: "text-violet-500 dark:text-violet-400",
    hover: "hover:text-violet-600 dark:hover:text-violet-300",
  },
  red: {
    text: "text-red-500 dark:text-red-400",
    hover: "hover:text-red-600 dark:hover:text-red-300",
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

const Register: React.FC = () => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterType>({
    mode: "onBlur",
  });

  const [isVisible, setIsVisible] = useState(false);
  const registerMutation = useRegister();
  const { themeColor } = useThemeColor();
  const rateLimit = useRateLimitGuard();

  const accent = useAccent(themeColor);

  const firstNameId = useId();
  const firstNameErrorId = useId();
  const lastNameId = useId();
  const lastNameErrorId = useId();
  const phoneId = useId();
  const phoneErrorId = useId();
  const passwordId = useId();
  const passwordErrorId = useId();

  /* Live password length indicator */
  const passwordValue = watch("password") ?? "";
  const passwordLength = passwordValue.length;
  const passwordMeetsMin = passwordLength >= 6;

  const toggleVisibility = useCallback(() => {
    setIsVisible((prev) => !prev);
  }, []);

  const handleRegister: SubmitHandler<RegisterType> = (data) => {
    if (rateLimit.isLimited) return;
    registerMutation.mutate(
      {
        first_name: data.first_name.trim(),
        last_name: data.last_name.trim(),
        phone_number: data.phone_number,
        password: data.password,
      },
      {
        onError: (error) => {
          rateLimit.triggerFromError(error);
        },
      },
    );
  };

  const isLoading = registerMutation.isPending;
  const isRateLimited = rateLimit.isLimited;
  const submitDisabled = isLoading || isRateLimited;

  const submitLabel = isRateLimited
    ? `لطفاً ${rateLimit.secondsLeft} ثانیه صبر کنید`
    : isLoading
      ? "در حال ثبت‌نام..."
      : "ثبت‌نام و ادامه";

  return (
    <section
      dir="rtl"
      className="min-h-dvh w-full bg-gray-50 dark:bg-gray-900 h-screen overflow-y-auto
    [-webkit-overflow-scrolling:touch]
    scrollbar-none
    [&::-webkit-scrollbar]:hidden"
    >
      <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center px-4 py-8 sm:px-6">
        {/* Brand */}
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 rounded-full bg-white p-2 shadow-md dark:bg-gray-800">
            <img
              src="/images/logo-main.png"
              alt="لوگو"
              className="h-20 w-20 rounded-full border border-primary-green-500 object-contain"
            />
          </div>
          <h1 className={`text-2xl font-bold sm:text-3xl ${accent.text}`}>
            ایجاد حساب کاربری
          </h1>
          <p className="mt-2 max-w-sm text-sm leading-6 text-gray-500 dark:text-gray-300">
            چند دقیقه وقت بگذارید؛ بعد از ثبت‌نام می‌توانید نقش خود را انتخاب
            کنید.
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-lg dark:border-gray-700 dark:bg-gray-800 sm:p-8">
          <form
            onSubmit={handleSubmit(handleRegister)}
            className="flex flex-col gap-5"
            noValidate
            aria-busy={isLoading}
          >
            {/* Name row */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
              <div className="space-y-1.5">
                <label
                  htmlFor={firstNameId}
                  className="block text-sm font-medium text-gray-700 dark:text-gray-200"
                >
                  نام
                </label>
                <div className="relative">
                  <input
                    id={firstNameId}
                    type="text"
                    autoComplete="given-name"
                    placeholder="مثلاً سارا"
                    aria-invalid={!!errors.first_name}
                    aria-describedby={
                      errors.first_name ? firstNameErrorId : undefined
                    }
                    className={`primary-input h-11 pe-10 ${inputErrorClass(
                      !!errors.first_name,
                    )}`}
                    {...register("first_name", {
                      required: "نام الزامی است",
                      minLength: {
                        value: 2,
                        message: "نام باید حداقل ۲ کاراکتر باشد",
                      },
                    })}
                  />
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">
                    <FaUser aria-hidden="true" />
                  </span>
                </div>
                {errors.first_name && (
                  <p
                    id={firstNameErrorId}
                    className="text-sm text-red-500 dark:text-red-400"
                    role="alert"
                  >
                    {errors.first_name.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor={lastNameId}
                  className="block text-sm font-medium text-gray-700 dark:text-gray-200"
                >
                  نام خانوادگی
                </label>
                <div className="relative">
                  <input
                    id={lastNameId}
                    type="text"
                    autoComplete="family-name"
                    placeholder="مثلاً محمدی"
                    aria-invalid={!!errors.last_name}
                    aria-describedby={
                      errors.last_name ? lastNameErrorId : undefined
                    }
                    className={`primary-input h-11 pe-10 ${inputErrorClass(
                      !!errors.last_name,
                    )}`}
                    {...register("last_name", {
                      required: "نام خانوادگی الزامی است",
                      minLength: {
                        value: 2,
                        message: "نام خانوادگی باید حداقل ۲ کاراکتر باشد",
                      },
                    })}
                  />
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">
                    <FaUser aria-hidden="true" />
                  </span>
                </div>
                {errors.last_name && (
                  <p
                    id={lastNameErrorId}
                    className="text-sm text-red-500 dark:text-red-400"
                    role="alert"
                  >
                    {errors.last_name.message}
                  </p>
                )}
              </div>
            </div>

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
                  className={`primary-input h-11 pl-10 ${inputErrorClass(
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
              <label
                htmlFor={passwordId}
                className="block text-sm font-medium text-gray-700 dark:text-gray-200"
              >
                رمز عبور
              </label>
              <div className="relative">
                <input
                  id={passwordId}
                  type={isVisible ? "text" : "password"}
                  maxLength={32}
                  autoComplete="new-password"
                  placeholder="حداقل ۶ کاراکتر"
                  aria-invalid={!!errors.password}
                  aria-describedby={
                    errors.password ? passwordErrorId : undefined
                  }
                  className={`primary-input h-11 px-10 text-left ${inputErrorClass(
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
                  onClick={toggleVisibility}
                  aria-label={isVisible ? "مخفی کردن رمز" : "نمایش رمز"}
                  aria-pressed={isVisible}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 text-gray-400 transition-colors hover:text-gray-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:text-gray-500 dark:hover:text-gray-200 dark:focus-visible:ring-gray-500 dark:focus-visible:ring-offset-gray-800"
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
              <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500">
                <span className="flex items-center gap-1" aria-hidden="true">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <span
                      key={i}
                      className={`inline-block h-1.5 w-1.5 rounded-full transition-colors ${
                        i < passwordLength
                          ? passwordMeetsMin
                            ? "bg-emerald-500"
                            : "bg-gray-400 dark:bg-gray-500"
                          : "bg-gray-200 dark:bg-gray-700"
                      }`}
                    />
                  ))}
                </span>
                <span>
                  {passwordMeetsMin
                    ? "طول رمز کافی است"
                    : `حداقل ۶ کاراکتر (${passwordLength}/۶)`}
                </span>
              </div>
            </div>

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

          {/* Login link */}
          <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-300">
            قبلاً ثبت‌نام کرده‌اید؟{" "}
            <Link
              to="/login"
              className={`rounded font-semibold ${accent.text} ${accent.hover} underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-gray-500 dark:focus-visible:ring-offset-gray-800`}
            >
              ورود
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
};

export default Register;
