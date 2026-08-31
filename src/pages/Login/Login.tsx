import React, { useCallback, useState } from "react";
import { Link, useNavigate } from "react-router";
import { FaPhoneAlt } from "react-icons/fa";
import Button from "../../components/Button/Button";
import { SubmitHandler, useForm } from "react-hook-form";
import { IoEye, IoEyeOff } from "react-icons/io5";
import { IoIosLock } from "react-icons/io";
import { useLogin } from "../../hooks/accounts/login/useLogin";
import { AxiosError } from "axios";
import toast from "react-hot-toast";
import { LoginType } from "../../types/login";
import { useThemeColor } from "../../context/ThemeColor";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../context/AuthContext";

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

  const toggle = useCallback(() => {
    setIsVisible((prev) => !prev);
  }, []);

  const handleLogin: SubmitHandler<LoginType> = (data) => {
    const toastId = toast.loading("در حال ورود...");

    loginMutation.mutate(data, {
      onSuccess: async (res) => {
        const savedType = localStorage.getItem("userType");
        const joined = localStorage.getItem("joinedBusiness");
        toast.success("ورود موفقیت‌آمیز بود!", { id: toastId });
        queryClient.setQueryData(["userProfile"], res.user);
        loginContext({ access: res.access, refresh: res.refresh }, res.user);

        if (!savedType) {
          navigate("/role-authentication", { replace: true });
        } else if (savedType === "owner") {
          navigate("/dashboard", { replace: true });
        } else if (savedType === "customer") {
          navigate(joined ? "/home" : "/join-salon", { replace: true });
        } else {
          navigate("/role-authentication", { replace: true });
        }
      },
      onError: (error) => {
        const axiosError = error as AxiosError;
        if (axiosError.response?.status === 401) {
          toast.error("شماره تلفن یا رمز عبور اشتباه است!", { id: toastId });
        } else {
          toast.error("خطای سرور، لطفاً بعداً تلاش کنید", { id: toastId });
        }
      },
    });
  };

  const inputErrorClass = (hasError: boolean) =>
    hasError
      ? "outline-red-400 dark:outline-red-500 focus:outline-red-500"
      : "";

  return (
    <section className="min-h-screen w-full bg-gray-50 dark:bg-gray-900 overflow-y-auto">
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
          >
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
                  aria-describedby={
                    errors.phone_number ? "phone_number-error" : undefined
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
                  id="phone_number-error"
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
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-200"
                >
                  رمز عبور
                </label>
                <button
                  type="button"
                  onClick={() => navigate("/forgot-password")}
                  className={`text-xs font-medium text-${themeColor}-500 hover:underline`}
                >
                  فراموشی رمز؟
                </button>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={isVisible ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="حداقل ۶ کاراکتر"
                  aria-invalid={!!errors.password}
                  aria-describedby={
                    errors.password ? "password-error" : undefined
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
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <IoIosLock size={18} />
                </span>
                <button
                  type="button"
                  onClick={toggle}
                  aria-label={isVisible ? "مخفی کردن رمز" : "نمایش رمز"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  {isVisible ? <IoEyeOff size={18} /> : <IoEye size={18} />}
                </button>
              </div>
              {errors.password && (
                <p
                  id="password-error"
                  className="text-sm text-red-500 dark:text-red-400"
                  role="alert"
                >
                  {errors.password.message}
                </p>
              )}
            </div>

            <Button type="submit" disabled={loginMutation.isPending}>
              {loginMutation.isPending ? "در حال ورود..." : "ورود به حساب"}
            </Button>
          </form>

          <div className="mt-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-gray-200 dark:bg-gray-600" />
            <span className="text-xs text-gray-400">یا</span>
            <div className="h-px flex-1 bg-gray-200 dark:bg-gray-600" />
          </div>

          <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-300">
            حساب کاربری ندارید؟{" "}
            <Link
              to="/register"
              className={`font-semibold text-${themeColor}-500 hover:underline`}
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
