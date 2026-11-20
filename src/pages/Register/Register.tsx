import React, { useState } from "react";
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

const Register: React.FC = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterType>({
    mode: "onBlur",
  });
  const [isVisible, setIsVisible] = useState(false);
  const registerMutation = useRegister();
  const { themeColor } = useThemeColor();
  const rateLimit = useRateLimitGuard();

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

  const inputErrorClass = (hasError: boolean) =>
    hasError
      ? "outline-red-400 dark:outline-red-500 focus:outline-red-500"
      : "";

  return (
    <section
      className="w-full bg-gray-50 dark:bg-gray-900 h-screen overflow-y-auto
    [-webkit-overflow-scrolling:touch]
    scrollbar-none
    [&::-webkit-scrollbar]:hidden"
    >
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-4 py-8 sm:px-6">
        {/* Brand */}
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 rounded-full bg-white p-2 shadow-md dark:bg-gray-800">
            <img
              src="/images/logo-main.png"
              alt="لوگو"
              className="h-20 w-20 rounded-full object-contain border border-primary-green-500"
            />
          </div>
          <h1
            className={`text-2xl sm:text-3xl font-bold text-${themeColor}-500`}
          >
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
          >
            {/* Name row */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label
                  htmlFor="first_name"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-200"
                >
                  نام
                </label>
                <div className="relative">
                  <input
                    id="first_name"
                    type="text"
                    autoComplete="given-name"
                    placeholder="مثلاً سارا"
                    aria-invalid={!!errors.first_name}
                    className={`primary-input pe-10 ${inputErrorClass(
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
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <FaUser />
                  </span>
                </div>
                {errors.first_name && (
                  <p
                    className="text-sm text-red-500 dark:text-red-400"
                    role="alert"
                  >
                    {errors.first_name.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="last_name"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-200"
                >
                  نام خانوادگی
                </label>
                <div className="relative">
                  <input
                    id="last_name"
                    type="text"
                    autoComplete="family-name"
                    placeholder="مثلاً محمدی"
                    aria-invalid={!!errors.last_name}
                    className={`primary-input pe-10 ${inputErrorClass(
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
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <FaUser />
                  </span>
                </div>
                {errors.last_name && (
                  <p
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
                htmlFor="phone_number"
                className="block text-sm font-medium text-gray-700 dark:text-gray-200"
              >
                شماره تلفن
              </label>
              <div className="relative">
                <input
                  id="phone_number"
                  type="tel"
                  inputMode="numeric"
                  maxLength={11}
                  autoComplete="username"
                  placeholder="09123456789"
                  aria-invalid={!!errors.phone_number}
                  className={`primary-input pl-10 ${inputErrorClass(
                    !!errors.phone_number,
                  )}`}
                  {...register("phone_number", {
                    required: "شماره تلفن الزامی است",
                    pattern: {
                      value: /^09[0-9]{9}$/,
                      message: "شماره باید ۱۱ رقم و با ۰۹ شروع شود",
                    },
                  })}
                  onKeyDown={(e) => {
                    if (
                      e.key.length === 1 &&
                      !/[0-9]/.test(e.key) &&
                      !e.ctrlKey &&
                      !e.metaKey
                    ) {
                      e.preventDefault();
                    }
                  }}
                />
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <FaPhoneAlt />
                </span>
              </div>
              {errors.phone_number && (
                <p
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
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 dark:text-gray-200"
              >
                رمز عبور
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={isVisible ? "text" : "password"}
                  maxLength={32}
                  autoComplete="new-password"
                  placeholder="حداقل ۶ کاراکتر"
                  aria-invalid={!!errors.password}
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
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <IoIosLock size={18} />
                </span>
                <button
                  type="button"
                  onClick={() => setIsVisible((v) => !v)}
                  aria-label={isVisible ? "مخفی کردن رمز" : "نمایش رمز"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  {isVisible ? <IoEyeOff size={18} /> : <IoEye size={18} />}
                </button>
              </div>
              {errors.password && (
                <p
                  className="text-sm text-red-500 dark:text-red-400"
                  role="alert"
                >
                  {errors.password.message}
                </p>
              )}
              <p className="text-xs text-gray-400 dark:text-gray-500">
                از ترکیب حروف و اعداد برای امنیت بیشتر استفاده کنید.
              </p>
            </div>

            <Button
              type="submit"
              disabled={registerMutation.isPending || rateLimit.isLimited}
            >
              {rateLimit.isLimited
                ? `لطفاً ${rateLimit.secondsLeft} ثانیه صبر کنید`
                : registerMutation.isPending
                  ? "در حال ثبت‌نام..."
                  : "ثبت‌نام و ادامه"}
            </Button>

            {rateLimit.isLimited && (
              <p
                className="text-center text-sm text-amber-600 dark:text-amber-400"
                role="status"
                aria-live="polite"
              >
                تعداد درخواست‌ها زیاد است. پس از پایان شمارش می‌توانید دوباره
                تلاش کنید.
              </p>
            )}
          </form>

          <div className="mt-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-gray-200 dark:bg-gray-600" />
            <span className="text-xs text-gray-400">یا</span>
            <div className="h-px flex-1 bg-gray-200 dark:bg-gray-600" />
          </div>

          <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-300">
            قبلاً ثبت‌نام کرده‌اید؟{" "}
            <Link
              to="/login"
              className={`font-semibold text-${themeColor}-500 hover:underline`}
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
