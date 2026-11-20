// src/components/PersianDayPicker/PersianDayPicker.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiCalendar,
  FiChevronLeft,
  FiChevronRight,
  FiX,
  FiCheck,
} from "react-icons/fi";
import { useThemeColor } from "../../context/ThemeColor";
import {
  themeText,
  themeBgSoft,
  themeBgSolid,
  themeRing,
} from "../../utils/themeClasses";
import {
  JALALI_MONTHS,
  WEEKDAYS_LONG,
  isoToJalali,
  jalaliToIso,
  jalaaliMonthLength,
  saturdayFirstWeekday,
  todayIso,
  toPersianDigits,
} from "../../utils/jalali";

interface PersianDayPickerProps {
  /** Gregorian "YYYY-MM-DD" or "". */
  value: string;
  /** Emits Gregorian "YYYY-MM-DD" or "". */
  onChange: (iso: string) => void;
  label?: string;
  placeholder?: string;
  min?: string;
  max?: string;
  disabled?: boolean;
  error?: string;
  helperText?: string;
  clearable?: boolean;
  /**
   * "dropdown" → trigger + popup (default, for standalone fields)
   * "inline"   → calendar rendered in place, no trigger/popup (use inside modals)
   */
  variant?: "dropdown" | "inline";
  /** Called only by the inline variant's "تایید" button. Optional. */
  onConfirm?: () => void;
}

const PersianDayPicker: React.FC<PersianDayPickerProps> = ({
  value,
  onChange,
  label,
  placeholder = "انتخاب تاریخ",
  min,
  max,
  disabled = false,
  error,
  helperText,
  clearable = true,
  variant = "dropdown",
  onConfirm,
}) => {
  const { themeColor } = useThemeColor();
  const wrapRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  const todayJ = useMemo(() => isoToJalali(todayIso())!, []);
  const selectedJ = useMemo(() => isoToJalali(value), [value]);

  const [view, setView] = useState(() =>
    selectedJ
      ? { jy: selectedJ.jy, jm: selectedJ.jm }
      : { jy: todayJ.jy, jm: todayJ.jm },
  );

  useEffect(() => {
    if (selectedJ) setView({ jy: selectedJ.jy, jm: selectedJ.jm });
  }, [selectedJ]);

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

  const grid = useMemo(() => {
    const monthLen = jalaaliMonthLength(view.jy, view.jm);
    const firstIso = jalaliToIso(view.jy, view.jm, 1);
    const [fy, fm, fd] = firstIso.split("-").map(Number);
    const offset = saturdayFirstWeekday(fy, fm, fd);

    type Cell = {
      iso: string;
      jy: number;
      jm: number;
      jd: number;
      inMonth: boolean;
    };
    const cells: Cell[] = [];

    const prevMonth = view.jm === 1 ? 12 : view.jm - 1;
    const prevYear = view.jm === 1 ? view.jy - 1 : view.jy;
    const prevLen = jalaaliMonthLength(prevYear, prevMonth);
    for (let i = offset - 1; i >= 0; i--) {
      const d = prevLen - i;
      cells.push({
        iso: jalaliToIso(prevYear, prevMonth, d),
        jy: prevYear,
        jm: prevMonth,
        jd: d,
        inMonth: false,
      });
    }
    for (let d = 1; d <= monthLen; d++) {
      cells.push({
        iso: jalaliToIso(view.jy, view.jm, d),
        jy: view.jy,
        jm: view.jm,
        jd: d,
        inMonth: true,
      });
    }
    const nextMonth = view.jm === 12 ? 1 : view.jm + 1;
    const nextYear = view.jm === 12 ? view.jy + 1 : view.jy;
    let d = 1;
    while (cells.length < 42) {
      cells.push({
        iso: jalaliToIso(nextYear, nextMonth, d),
        jy: nextYear,
        jm: nextMonth,
        jd: d,
        inMonth: false,
      });
      d++;
    }
    return cells;
  }, [view]);

  const isDisabled = (iso: string) => {
    if (min && iso < min) return true;
    if (max && iso > max) return true;
    return false;
  };

  const pick = (iso: string) => {
    if (isDisabled(iso)) return;
    onChange(iso);
    // inline: keep calendar open so user can confirm; dropdown: close
    if (variant === "dropdown") setOpen(false);
  };

  const goMonth = (delta: number) => {
    setView((v) => {
      let jm = v.jm + delta;
      let jy = v.jy;
      if (jm < 1) {
        jm = 12;
        jy -= 1;
      }
      if (jm > 12) {
        jm = 1;
        jy += 1;
      }
      return { jy, jm };
    });
  };

  const goToday = () => setView({ jy: todayJ.jy, jm: todayJ.jm });

  const displayValue = selectedJ
    ? `${toPersianDigits(selectedJ.jy)}/${toPersianDigits(
        String(selectedJ.jm).padStart(2, "0"),
      )}/${toPersianDigits(String(selectedJ.jd).padStart(2, "0"))}`
    : "";

  const monthTitle = `${JALALI_MONTHS[view.jm - 1]} ${toPersianDigits(view.jy)}`;

  const borderCls = error
    ? "border-red-400 dark:border-red-500"
    : "border-gray-200 dark:border-gray-600";

  /* ---------- shared calendar body ---------- */
  const CalendarBody = (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <button
          type="button"
          onClick={() => goMonth(-1)}
          aria-label="ماه قبل"
          className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors"
        >
          <FiChevronRight size={18} />
        </button>
        <span className="text-sm font-semibold text-gray-800 dark:text-white">
          {monthTitle}
        </span>
        <button
          type="button"
          onClick={() => goMonth(1)}
          aria-label="ماه بعد"
          className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors"
        >
          <FiChevronLeft size={18} />
        </button>
      </div>

      {/* Weekday header */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {WEEKDAYS_LONG.map((w) => (
          <div
            key={w}
            className="text-center textarea-xs font-medium text-gray-400 dark:text-gray-500 py-1"
            title={w}
          >
            {w[0]}
          </div>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-7 gap-1">
        {grid.map((c, i) => {
          const isToday = c.iso === todayIso();
          const isSelected = c.iso === value;
          const isDis = isDisabled(c.iso);
          const isFriday = i % 7 === 6;
          const base =
            "h-9 rounded-lg text-sm flex items-center justify-center transition-colors";

          let cls = base;
          if (isDis) {
            cls += " text-gray-300 dark:text-gray-600 cursor-not-allowed";
          } else if (isSelected) {
            cls += ` ${themeBgSolid[themeColor]} text-white font-semibold shadow-sm`;
          } else if (!c.inMonth) {
            cls +=
              " text-gray-300 dark:text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/50";
          } else if (isFriday) {
            cls +=
              " text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20";
          } else if (isToday) {
            cls += ` ${themeBgSoft[themeColor]} ${themeText[themeColor]} font-semibold ring-1 ring-inset ${themeRing[themeColor]}`;
          } else {
            cls +=
              " text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700";
          }

          return (
            <button
              key={c.iso + i}
              type="button"
              disabled={isDis}
              onClick={() => pick(c.iso)}
              aria-label={`${toPersianDigits(c.jd)} ${JALALI_MONTHS[c.jm - 1]} ${toPersianDigits(c.jy)}`}
              className={cls}
            >
              {toPersianDigits(c.jd)}
            </button>
          );
        })}
      </div>
    </>
  );

  /* ---------- INLINE variant ---------- */
  if (variant === "inline") {
    return (
      <div className="w-full">
        {label && (
          <label className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-300 mb-1.5">
            <FiCalendar /> {label}
          </label>
        )}

        <div
          className={`rounded-2xl border bg-gray-50 dark:bg-gray-800/60 p-3 ${borderCls}`}
          style={{ direction: "rtl" }}
        >
          {CalendarBody}

          {/* Footer: selected summary + today + confirm */}
          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {displayValue ? (
                <>
                  انتخاب‌شده:{" "}
                  <span className={`font-semibold ${themeText[themeColor]}`}>
                    {displayValue}
                  </span>
                </>
              ) : (
                "روزی را انتخاب کنید"
              )}
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={goToday}
                className={`text-xs font-medium px-3 py-1.5 rounded-lg ${themeBgSoft[themeColor]} ${themeText[themeColor]} hover:opacity-80 transition-opacity`}
              >
                امروز
              </button>

              {onConfirm && (
                <button
                  type="button"
                  onClick={onConfirm}
                  disabled={!displayValue}
                  className={`text-xs font-medium px-3 py-1.5 rounded-lg ${themeBgSolid[themeColor]} text-white flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <FiCheck size={12} />
                  تایید
                </button>
              )}
            </div>
          </div>
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

  /* ---------- DROPDOWN variant (unchanged behavior) ---------- */
  return (
    <div className="w-full relative" ref={wrapRef}>
      {label && (
        <label className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-300 mb-1.5">
          <FiCalendar /> {label}
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
              aria-label="پاک کردن تاریخ"
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
          <FiCalendar className="text-gray-400 dark:text-gray-500" size={16} />
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
            aria-label="انتخاب تاریخ"
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            style={{ direction: "rtl" }}
            className="absolute z-50 mt-2 right-0 w-[320px] max-w-[calc(100vw-2rem)] rounded-2xl bg-white dark:bg-gray-800 shadow-xl border border-gray-200 dark:border-gray-700 p-3"
          >
            {CalendarBody}
            <div className="mt-3 pt-2 border-t border-gray-100 dark:border-gray-700 flex justify-center">
              <button
                type="button"
                onClick={goToday}
                className={`text-xs font-medium px-3 py-1.5 rounded-lg ${themeBgSoft[themeColor]} ${themeText[themeColor]} hover:opacity-80 transition-opacity`}
              >
                امروز
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PersianDayPicker;
