import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { LuShieldCheck, LuKeyRound, LuInfo } from "react-icons/lu";
import { useNavigate } from "react-router";
import toast from "react-hot-toast";

import { useThemeColor } from "../../../context/ThemeColor";
import {
  themeBgSolid,
  themeBgSoft,
  themeRing,
  themeText,
} from "../../../utils/themeClasses";
import { useChangePassword } from "../../../hooks/accounts/change-password/useChangePassword";
import type { ChangePasswordType } from "../../../types/change-password-type";
import { parseApiError } from "../../../utils/parseApiError";
import { AnimatedCheck } from "../AnimatedCheck";
import { PasswordField } from "../PasswordField";
import { StrengthMeter } from "../StrengthMeter";
import { SettingsSectionCard } from "../SettingsSectionCard";

/* -------------------------------------------------------------------------- */
/* Schema                                                                     */
/* -------------------------------------------------------------------------- */

const passwordSchema = z
  .object({
    old_password: z.string().min(1, "رمز فعلی را وارد کنید"),
    new_password: z
      .string()
      .min(8, "رمز جدید باید حداقل ۸ کاراکتر باشد")
      .max(128, "رمز خیلی طولانی است"),
    confirm_password: z.string().min(1, "تکرار رمز را وارد کنید"),
  })
  .refine((d) => d.new_password === d.confirm_password, {
    message: "رمز جدید و تکرار آن یکسان نیستند",
    path: ["confirm_password"],
  })
  .refine((d) => d.old_password !== d.new_password, {
    message: "رمز جدید نباید با رمز فعلی یکی باشد",
    path: ["new_password"],
  });

type FormValues = z.infer<typeof passwordSchema>;

/* -------------------------------------------------------------------------- */
/* Strength helper                                                            */
/* -------------------------------------------------------------------------- */

const calcStrength = (pwd: string): number => {
  let s = 0;
  if (pwd.length >= 8) s++;
  if (/[A-Za-z]/.test(pwd) && /\d/.test(pwd)) s++;
  if (/[^A-Za-z0-9]/.test(pwd)) s++;
  if (pwd.length >= 12) s++;
  return Math.min(4, s);
};

/* -------------------------------------------------------------------------- */
/* Section                                                                    */
/* -------------------------------------------------------------------------- */

export const ChangePasswordSection: React.FC = () => {
  const navigate = useNavigate();
  const { themeColor } = useThemeColor();
  const changeMutation = useChangePassword();
  const [done, setDone] = useState(false);
  const successBtnRef = useRef<HTMLButtonElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const successTimerRef = useRef<number | null>(null);
  const focusTimerRef = useRef<number | null>(null);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isValid, isDirty },
  } = useForm<FormValues>({
    resolver: zodResolver(passwordSchema),
    mode: "onTouched",
    defaultValues: {
      old_password: "",
      new_password: "",
      confirm_password: "",
    },
  });

  // Scoped subscriptions — only these subtrees re-render on keystrokes,
  // not the whole form.
  const newPwd = useWatch({ control, name: "new_password" }) ?? "";
  const confirmPwd = useWatch({ control, name: "confirm_password" }) ?? "";

  const strengthScore = useMemo(() => calcStrength(newPwd), [newPwd]);
  const matches =
    confirmPwd.length > 0 && newPwd === confirmPwd && !errors.confirm_password;

  /* ------------------------------ Timer cleanup ------------------------------ */

  useEffect(() => {
    return () => {
      if (successTimerRef.current != null) {
        window.clearTimeout(successTimerRef.current);
      }
      if (focusTimerRef.current != null) {
        window.clearTimeout(focusTimerRef.current);
      }
    };
  }, []);

  /* ------------------------------ Handlers ------------------------------ */

  const onSubmit = (values: FormValues) => {
    const payload: ChangePasswordType = {
      old_password: values.old_password,
      new_password: values.new_password,
      confirm_password: values.confirm_password,
    };

    changeMutation.mutate(payload, {
      onSuccess: () => {
        setDone(true);
        reset();

        successTimerRef.current = window.setTimeout(() => {
          setDone(false);
        }, 4000);

        focusTimerRef.current = window.setTimeout(() => {
          successBtnRef.current?.focus();
        }, 50);
      },
      onError: (error) => {
        toast.error(parseApiError(error) || "تغییر رمز ناموفق بود");
      },
    });
  };

  const onInvalid = () => {
    const firstError = formRef.current?.querySelector<HTMLInputElement>(
      'input[aria-invalid="true"]',
    );
    firstError?.scrollIntoView({ behavior: "smooth", block: "center" });
    firstError?.focus();
  };

  const handleSuccessBack = useCallback(() => {
    if (successTimerRef.current != null) {
      window.clearTimeout(successTimerRef.current);
      successTimerRef.current = null;
    }
    if (focusTimerRef.current != null) {
      window.clearTimeout(focusTimerRef.current);
      focusTimerRef.current = null;
    }
    navigate(-1);
  }, [navigate]);

  /* ------------------------------ Render ------------------------------ */

  return (
    <SettingsSectionCard
      icon={LuKeyRound}
      title="تغییر رمز عبور"
      description="برای امنیت بیشتر، رمزی حداقل ۸ کاراکتر با ترکیب حروف و عدد انتخاب کنید."
      headingId="settings-change-password-heading"
    >
      <AnimatePresence mode="wait">
        {done ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 24 }}
            className="flex flex-col items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-8 text-center dark:border-emerald-800 dark:bg-emerald-900/20"
            role="status"
            aria-live="polite"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 shadow-inner dark:bg-emerald-900/40 dark:text-emerald-400">
              <AnimatedCheck />
            </div>
            <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-200">
              رمز عبور با موفقیت به‌روز شد
            </p>
            <button
              ref={successBtnRef}
              type="button"
              onClick={handleSuccessBack}
              className="rounded-lg px-3 py-1.5 text-xs font-medium text-emerald-700 underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:text-emerald-300 dark:focus-visible:ring-offset-gray-900"
            >
              بازگشت
            </button>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            ref={formRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onSubmit={handleSubmit(onSubmit, onInvalid)}
            className="space-y-4"
            noValidate
            autoComplete="off"
            aria-busy={changeMutation.isPending}
          >
            <PasswordField
              id="old_password"
              name="old_password"
              label="رمز فعلی"
              autoComplete="current-password"
              error={errors.old_password?.message}
              register={register}
              describedBy={errors.old_password ? "old_password_err" : undefined}
            />

            <PasswordField
              id="new_password"
              name="new_password"
              label="رمز جدید"
              autoComplete="new-password"
              error={errors.new_password?.message}
              register={register}
              describedBy="new_password_strength"
              hint="ترکیبی از حروف، اعداد و نمادها امنیت را افزایش می‌دهد."
            />

            <div id="new_password_strength">
              <StrengthMeter
                score={strengthScore}
                visible={newPwd.length > 0}
              />
            </div>

            <PasswordField
              id="confirm_password"
              name="confirm_password"
              label="تکرار رمز جدید"
              autoComplete="new-password"
              error={errors.confirm_password?.message}
              register={register}
              validMatch={matches}
              describedBy={
                errors.confirm_password ? "confirm_password_err" : undefined
              }
            />

            <div
              role="note"
              className={`flex items-start gap-2 rounded-xl p-3 text-xs leading-5 ring-1 ${themeBgSoft[themeColor]} ${themeText[themeColor]} ${themeRing[themeColor]}`}
            >
              <LuInfo
                size={14}
                className="mt-0.5 shrink-0 opacity-80"
                aria-hidden="true"
              />
              <span>
                پس از تغییر موفق رمز، در دستگاه‌های دیگر ممکن است نیاز به ورود
                مجدد داشته باشید.
              </span>
            </div>

            <div className="space-y-2 pt-1">
              <button
                type="submit"
                disabled={!isDirty || !isValid || changeMutation.isPending}
                className={`flex h-11 w-full items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold text-white shadow-sm transition-all duration-150 hover:brightness-110 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:brightness-100 disabled:active:scale-100 motion-reduce:transition-none ${themeBgSolid[themeColor]}`}
              >
                {changeMutation.isPending ? (
                  <>
                    در حال ذخیره...
                    <span
                      className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white motion-reduce:animate-none"
                      aria-hidden="true"
                    />
                  </>
                ) : (
                  <>
                    <LuShieldCheck size={16} aria-hidden="true" />
                    ذخیره رمز جدید
                  </>
                )}
              </button>
              {isDirty && !isValid && (
                <p className="text-center text-xs text-gray-500 dark:text-gray-400">
                  برای فعال‌سازی، فرم را کامل کنید
                </p>
              )}
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </SettingsSectionCard>
  );
};
