/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useId, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LuLock, LuEye, LuEyeOff, LuCheck } from "react-icons/lu";
import type { useForm } from "react-hook-form";
import { ThemeColorName, useThemeColor } from "../../context/ThemeColor";
import { themeRing } from "../../utils/themeClasses";

/** Static, JIT-visible focus ring classes per theme. */
const themeFocusRing: Record<ThemeColorName, string> = {
  "primary-green":
    "focus:border-primary-green-500 focus:ring-2 focus:ring-primary-green-500/25 dark:focus:border-primary-green-400 dark:focus:ring-primary-green-400/20",
  orange:
    "focus:border-orange-500 focus:ring-2 focus:ring-orange-500/25 dark:focus:border-orange-400 dark:focus:ring-orange-400/20",
  blue: "focus:border-blue-500 focus:ring-2 focus:ring-blue-500/25 dark:focus:border-blue-400 dark:focus:ring-blue-400/20",
  red: "focus:border-red-500 focus:ring-2 focus:ring-red-500/25 dark:focus:border-red-400 dark:focus:ring-red-400/20",
  green:
    "focus:border-green-500 focus:ring-2 focus:ring-green-500/25 dark:focus:border-green-400 dark:focus:ring-green-400/20",
  purple:
    "focus:border-purple-500 focus:ring-2 focus:ring-purple-500/25 dark:focus:border-purple-400 dark:focus:ring-purple-400/20",
  yellow:
    "focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/25 dark:focus:border-yellow-400 dark:focus:ring-yellow-400/20",
};

/** Static, JIT-visible focus icon color per theme. */
const themeIconFocus: Record<ThemeColorName, string> = {
  "primary-green":
    "group-focus-within:text-primary-green-500 dark:group-focus-within:text-primary-green-400",
  orange:
    "group-focus-within:text-orange-500 dark:group-focus-within:text-orange-400",
  blue: "group-focus-within:text-blue-500 dark:group-focus-within:text-blue-400",
  red: "group-focus-within:text-red-500 dark:group-focus-within:text-red-400",
  green:
    "group-focus-within:text-green-500 dark:group-focus-within:text-green-400",
  purple:
    "group-focus-within:text-purple-500 dark:group-focus-within:text-purple-400",
  yellow:
    "group-focus-within:text-yellow-500 dark:group-focus-within:text-yellow-400",
};

interface PasswordFieldProps {
  id: string;
  label: string;
  autoComplete: string;
  error?: string;
  register: ReturnType<typeof useForm<any>>["register"];
  name: string;
  validMatch?: boolean;
  hint?: string;
  describedBy?: string;
}

export const PasswordField: React.FC<PasswordFieldProps> = ({
  id,
  label,
  autoComplete,
  error,
  register,
  name,
  validMatch,
  hint,
  describedBy,
}) => {
  const [visible, setVisible] = useState(false);
  const toggleId = useId();
  const { themeColor } = useThemeColor();

  const borderClass = error
    ? "border-rose-400 focus:border-rose-400 focus:ring-2 focus:ring-rose-300/40"
    : validMatch
      ? "border-emerald-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-400/30"
      : `border-gray-200 dark:border-gray-700 ${themeFocusRing[themeColor]}`;

  const iconClass = error
    ? "text-rose-400"
    : validMatch
      ? "text-emerald-500"
      : `text-gray-400 ${themeIconFocus[themeColor]}`;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label
          htmlFor={id}
          className="block text-sm font-medium text-gray-700 dark:text-gray-200"
        >
          {label}
        </label>
        {validMatch && (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            <LuCheck size={12} aria-hidden="true" /> مطابقت دارد
          </span>
        )}
      </div>

      <div className="group relative">
        <span
          className={`pointer-events-none absolute inset-y-0 right-3 flex items-center transition-colors duration-150 ${iconClass}`}
        >
          <LuLock size={16} aria-hidden="true" />
        </span>

        <input
          id={id}
          type={visible ? "text" : "password"}
          autoComplete={autoComplete}
          aria-invalid={!!error}
          aria-describedby={describedBy}
          className={`h-11 w-full rounded-xl border bg-white pr-10 pl-11 text-sm text-gray-900 outline-none transition-all duration-150 focus:ring-offset-1 focus:ring-offset-white dark:bg-gray-900 dark:text-white dark:focus:ring-offset-gray-900 ${borderClass}`}
          {...register(name)}
        />

        <button
          type="button"
          id={toggleId}
          onClick={() => setVisible((v) => !v)}
          aria-pressed={visible}
          className={`absolute inset-y-0 left-2 my-1 flex items-center rounded-lg px-2 transition hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 dark:hover:bg-gray-800 ${themeRing[themeColor]}`}
          aria-label={visible ? "مخفی کردن رمز" : "نمایش رمز"}
        >
          {visible ? (
            <LuEyeOff size={18} aria-hidden="true" />
          ) : (
            <LuEye size={18} aria-hidden="true" />
          )}
        </button>
      </div>

      {hint && !error && (
        <p className="text-xs text-gray-500 dark:text-gray-400">{hint}</p>
      )}

      {/* Reserved space prevents layout shift when the error appears/disappears */}
      <div className="min-h-4">
        <AnimatePresence>
          {error && (
            <motion.p
              key="err"
              initial={{ opacity: 0, x: -4 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              className="text-xs font-medium text-rose-600 dark:text-rose-400"
              role="alert"
              id={describedBy}
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
