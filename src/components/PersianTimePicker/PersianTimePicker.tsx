import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiClock, FiX, FiCheck } from "react-icons/fi";
import { useThemeColor } from "../../context/ThemeColor";
import { themeText, themeBgSolid, themeRing } from "../../utils/themeClasses";
import { toPersianDigits } from "../../utils/jalali";

interface PersianTimePickerProps {
  /** "HH:mm" (24h) or "". */
  value: string;
  /** Emits "HH:mm" (24h) or "". */
  onChange: (time: string) => void;
  label?: string;
  placeholder?: string;
  /** Minute step (default 5). */
  minuteStep?: number;
  disabled?: boolean;
  error?: string;
  helperText?: string;
  clearable?: boolean;
  /**
   * "dropdown" → trigger + popup (default)
   * "inline"   → hour/minute columns rendered in place (use inside modals)
   */
  variant?: "dropdown" | "inline";
}

const pad2 = (n: number) => String(n).padStart(2, "0");

const PersianTimePicker: React.FC<PersianTimePickerProps> = ({
  value,
  onChange,
  label,
  placeholder = "انتخاب ساعت",
  minuteStep = 5,
  disabled = false,
  error,
  helperText,
  clearable = true,
  variant = "dropdown",
}) => {
  const { themeColor } = useThemeColor();
  const wrapRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  const parsed = useMemo(() => {
    if (!value) return { h: -1, m: -1 };
    const [h, m] = value.split(":").map(Number);
    return { h: Number.isFinite(h) ? h : -1, m: Number.isFinite(m) ? m : 0 };
  }, [value]);

  // For inline variant, work directly on the value; for dropdown, use draft state
  const [hour, setHour] = useState(parsed.h >= 0 ? parsed.h : 9);
  const [minute, setMinute] = useState(parsed.m >= 0 ? parsed.m : 0);

  // Keep inline hour/minute in sync with the value coming from the parent
  useEffect(() => {
    if (variant === "inline") {
      setHour(parsed.h >= 0 ? parsed.h : 9);
      setMinute(parsed.m >= 0 ? parsed.m : 0);
    }
  }, [parsed.h, parsed.m, variant]);

  // Dropdown: reset drafts each time the popup opens
  useEffect(() => {
    if (variant === "dropdown" && open) {
      setHour(parsed.h >= 0 ? parsed.h : 9);
      setMinute(parsed.m >= 0 ? parsed.m : 0);
    }
  }, [open, parsed.h, parsed.m, variant]);

  useEffect(() => {
    if (variant !== "dropdown" || !open) return;
    const onDoc = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, variant]);

  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = Array.from(
    { length: Math.ceil(60 / minuteStep) },
    (_, i) => i * minuteStep,
  );

  const commit = () => {
    onChange(`${pad2(hour)}:${pad2(minute)}`);
    if (variant === "dropdown") setOpen(false);
  };

  const displayValue = value
    ? `${toPersianDigits(pad2(parsed.h))}:${toPersianDigits(pad2(parsed.m))}`
    : "";

  const borderCls = error
    ? "border-red-400 dark:border-red-500"
    : "border-gray-200 dark:border-gray-600";

  /* ---------- shared hour/minute columns ---------- */
  const Columns = (
    <>
      <div
        className={`text-center text-2xl font-bold tracking-widest ${themeText[themeColor]} mb-3 tabular-nums`}
      >
        {toPersianDigits(pad2(hour))}:{toPersianDigits(pad2(minute))}
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <div className="text-center textarea-xs font-medium text-gray-400 dark:text-gray-500 mb-1">
            ساعت
          </div>
          <div className="h-40 overflow-y-auto rounded-lg border border-gray-100 dark:border-gray-700 divide-y divide-gray-100 dark:divide-gray-700/50">
            {hours.map((h) => (
              <button
                key={h}
                type="button"
                onClick={() => {
                  setHour(h);
                  if (variant === "inline") {
                    onChange(`${pad2(h)}:${pad2(minute)}`);
                  }
                }}
                className={`w-full py-1.5 text-sm transition-colors ${
                  h === hour
                    ? `${themeBgSolid[themeColor]} text-white font-semibold`
                    : "text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
                }`}
              >
                {toPersianDigits(pad2(h))}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="text-center textarea-xs font-medium text-gray-400 dark:text-gray-500 mb-1">
            دقیقه
          </div>
          <div className="h-40 overflow-y-auto rounded-lg border border-gray-100 dark:border-gray-700 divide-y divide-gray-100 dark:divide-gray-700/50">
            {minutes.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => {
                  setMinute(m);
                  if (variant === "inline") {
                    onChange(`${pad2(hour)}:${pad2(m)}`);
                  }
                }}
                className={`w-full py-1.5 text-sm transition-colors ${
                  m === minute
                    ? `${themeBgSolid[themeColor]} text-white font-semibold`
                    : "text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
                }`}
              >
                {toPersianDigits(pad2(m))}
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );

  /* ---------- INLINE variant ---------- */
  if (variant === "inline") {
    return (
      <div className="w-full">
        {label && (
          <label className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-300 mb-1.5">
            <FiClock /> {label}
          </label>
        )}

        <div
          className={`rounded-2xl border bg-gray-50 dark:bg-gray-800/60 p-3 ${borderCls}`}
          style={{ direction: "rtl" }}
        >
          {Columns}
        </div>

        {error ? (
          <p className="mt-1.5 textarea-xs leading-5 text-red-500 dark:text-red-400">
            {error}
          </p>
        ) : helperText ? (
          <p className="mt-1.5 textarea-xs leading-5 text-gray-400 dark:text-gray-500">
            {helperText}
          </p>
        ) : null}
      </div>
    );
  }

  /* ---------- DROPDOWN variant (default) ---------- */
  return (
    <div className="w-full relative" ref={wrapRef}>
      {label && (
        <label className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-300 mb-1.5">
          <FiClock /> {label}
        </label>
      )}

      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen((v) => !v)}
        aria-haspopup="dialog"
        aria-expanded={open}
        className={`w-full flex items-center justify-between gap-2 rounded-xl border bg-white dark:bg-gray-800 px-3 py-2.5 text-sm text-start transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 dark:focus:ring-offset-gray-800 ${borderCls} ${themeRing[themeColor]} disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        <span
          className={
            displayValue
              ? "text-gray-900 dark:text-white"
              : "text-gray-400 dark:text-gray-500"
          }
        >
          {displayValue || placeholder}
        </span>
        <span className="flex items-center gap-1 shrink-0">
          {clearable && displayValue && !disabled && (
            <span
              role="button"
              tabIndex={0}
              aria-label="پاک کردن ساعت"
              onClick={(e) => {
                e.stopPropagation();
                onChange("");
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  e.stopPropagation();
                  onChange("");
                }
              }}
              className="p-0.5 rounded text-gray-400 hover:text-red-500 transition-colors"
            >
              <FiX size={14} />
            </span>
          )}
          <FiClock className="text-gray-400 dark:text-gray-500" size={16} />
        </span>
      </button>

      {error ? (
        <p className="mt-1.5 textarea-xs leading-5 text-red-500 dark:text-red-400">
          {error}
        </p>
      ) : helperText ? (
        <p className="mt-1.5 textarea-xs leading-5 text-gray-400 dark:text-gray-500">
          {helperText}
        </p>
      ) : null}

      <AnimatePresence>
        {open && (
          <motion.div
            role="dialog"
            aria-label="انتخاب ساعت"
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            style={{ direction: "rtl" }}
            className="absolute z-50 mt-2 right-0 w-70 max-w-[calc(100vw-2rem)] rounded-2xl bg-white dark:bg-gray-800 shadow-xl border border-gray-200 dark:border-gray-700 p-3"
          >
            {Columns}

            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex-1 py-2 rounded-lg text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                انصراف
              </button>
              <button
                type="button"
                onClick={commit}
                className={`flex-1 py-2 rounded-lg text-sm font-medium ${themeBgSolid[themeColor]} text-white flex items-center justify-center gap-1.5`}
              >
                <FiCheck size={14} />
                تایید
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PersianTimePicker;
