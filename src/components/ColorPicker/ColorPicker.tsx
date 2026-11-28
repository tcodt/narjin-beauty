import React, { useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LuCheck } from "react-icons/lu";
import { useThemeColor } from "../../context/ThemeColor";
import type { ThemeColorName } from "../../context/ThemeColor";

/* -------------------------------------------------------------------------- */
/* Static color classes — Tailwind JIT must see these literals                */
/* -------------------------------------------------------------------------- */

/**
 * Each theme is described by three visual roles, all as literal classes:
 * - `chip`   → the primary swatch (the theme's accent color)
 * - `soft`   → the tinted surface (used for backgrounds, cards, subtle fills)
 * - `border` → the ring/border accent (used for focus outlines, selected states)
 * - `onChip` → text color that contrasts on top of the chip
 */
const themeClasses: Record<
  ThemeColorName,
  { chip: string; soft: string; border: string; onChip: string }
> = {
  "primary-green": {
    chip: "bg-primary-green-500",
    soft: "bg-primary-green-500/10",
    border: "ring-primary-green-500/40",
    onChip: "text-white",
  },
  orange: {
    chip: "bg-orange-500",
    soft: "bg-orange-500/10",
    border: "ring-orange-500/40",
    onChip: "text-gray-900",
  },
  blue: {
    chip: "bg-blue-500",
    soft: "bg-blue-500/10",
    border: "ring-blue-500/40",
    onChip: "text-white",
  },
  red: {
    chip: "bg-red-500",
    soft: "bg-red-500/10",
    border: "ring-red-500/40",
    onChip: "text-white",
  },
  green: {
    chip: "bg-green-500",
    soft: "bg-green-500/10",
    border: "ring-green-500/40",
    onChip: "text-gray-900",
  },
  purple: {
    chip: "bg-purple-500",
    soft: "bg-purple-500/10",
    border: "ring-purple-500/40",
    onChip: "text-white",
  },
  yellow: {
    chip: "bg-yellow-500",
    soft: "bg-yellow-500/10",
    border: "ring-yellow-500/40",
    onChip: "text-gray-900",
  },
};

const colorOptions: { name: ThemeColorName; label: string }[] = [
  { name: "primary-green", label: "سبز اصلی" },
  { name: "orange", label: "نارنجی" },
  { name: "blue", label: "آبی" },
  { name: "red", label: "قرمز" },
  { name: "green", label: "سبز" },
  { name: "purple", label: "بنفش" },
  { name: "yellow", label: "زرد" },
];

/* -------------------------------------------------------------------------- */
/* Theme card                                                                 */
/* -------------------------------------------------------------------------- */

interface ThemeCardProps {
  name: ThemeColorName;
  label: string;
  selected: boolean;
  onSelect: () => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLButtonElement>) => void;
  tabIndex: number;
  buttonRef: (el: HTMLButtonElement | null) => void;
}

const ThemeCard: React.FC<ThemeCardProps> = ({
  name,
  label,
  selected,
  onSelect,
  onKeyDown,
  tabIndex,
  buttonRef,
}) => {
  const t = themeClasses[name];

  return (
    <button
      ref={buttonRef}
      type="button"
      role="radio"
      aria-checked={selected}
      aria-label={label}
      tabIndex={tabIndex}
      onClick={onSelect}
      onKeyDown={onKeyDown}
      className={`group relative flex flex-col gap-2.5 rounded-xl border p-3 text-start outline-none transition-all duration-150 motion-reduce:transition-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-gray-500 dark:focus-visible:ring-offset-gray-900 ${
        selected
          ? `border-gray-900 bg-white shadow-sm dark:border-white dark:bg-gray-800`
          : `border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50/50 dark:border-gray-700 dark:bg-gray-900 dark:hover:border-gray-600 dark:hover:bg-gray-800/40`
      }`}
    >
      {/* Selection check */}
      <AnimatePresence>
        {selected && (
          <motion.span
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 24 }}
            className="absolute inset-e-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-gray-900 text-white shadow-sm dark:bg-white dark:text-gray-900"
            aria-hidden="true"
          >
            <LuCheck size={12} strokeWidth={3} />
          </motion.span>
        )}
      </AnimatePresence>

      {/* Header: color chip + name */}
      <div className="flex items-center gap-2">
        <span
          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg shadow-sm ring-1 ring-black/5 dark:ring-white/10 ${t.chip}`}
          aria-hidden="true"
        >
          {selected && (
            <LuCheck size={14} strokeWidth={3} className={t.onChip} />
          )}
        </span>
        <span className="text-sm font-medium text-gray-900 dark:text-white">
          {label}
        </span>
      </div>

      {/* Mini theme preview — shows the applied effect */}
      <div
        className={`flex items-center gap-1.5 rounded-lg p-2 ${t.soft} ring-1 ring-inset ${t.border}`}
        aria-hidden="true"
      >
        <span className={`h-1.5 flex-1 rounded-full ${t.chip}`} />
        <span className={`h-1.5 w-6 rounded-full ${t.chip} opacity-60`} />
        <span className={`h-1.5 w-3 rounded-full ${t.chip} opacity-30`} />
      </div>

      {/* Sample content — simulates what a card/text would look like */}
      <div className="space-y-1" aria-hidden="true">
        <div
          className={`h-1 w-3/4 rounded-full bg-gray-300 dark:bg-gray-600`}
        />
        <div
          className={`h-1 w-1/2 rounded-full bg-gray-200 dark:bg-gray-700`}
        />
      </div>
    </button>
  );
};

/* -------------------------------------------------------------------------- */
/* Component                                                                  */
/* -------------------------------------------------------------------------- */

const ColorPicker: React.FC = () => {
  const { themeColor, setThemeColor } = useThemeColor();
  const btnRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
      const last = colorOptions.length - 1;
      let next = index;

      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault();
        next = index === last ? 0 : index + 1;
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        next = index === 0 ? last : index - 1;
      } else if (e.key === "Home") {
        e.preventDefault();
        next = 0;
      } else if (e.key === "End") {
        e.preventDefault();
        next = last;
      } else {
        return;
      }

      btnRefs.current[next]?.focus();
      setThemeColor(colorOptions[next].name);
    },
    [setThemeColor],
  );

  const activeOption =
    colorOptions.find((c) => c.name === themeColor) ?? colorOptions[0];
  const activeClasses = themeClasses[activeOption.name];

  return (
    <div className="space-y-5">
      {/* Cards grid */}
      <div
        role="radiogroup"
        aria-label="انتخاب تم رنگی"
        className="grid grid-cols-2 gap-2.5 sm:grid-cols-2"
      >
        {colorOptions.map(({ name, label }, index) => (
          <ThemeCard
            key={name}
            name={name}
            label={label}
            selected={themeColor === name}
            onSelect={() => setThemeColor(name)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            tabIndex={themeColor === name ? 0 : -1}
            buttonRef={(el) => {
              btnRefs.current[index] = el;
            }}
          />
        ))}
      </div>

      {/* Current theme summary */}
      <div
        className={`flex items-center justify-between gap-3 rounded-xl border border-gray-100 bg-gray-50/60 p-3 dark:border-gray-800 dark:bg-gray-800/40`}
        role="status"
        aria-live="polite"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <span
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg shadow-sm ring-1 ring-black/5 dark:ring-white/10 ${activeClasses.chip}`}
            aria-hidden="true"
          >
            <LuCheck
              size={14}
              strokeWidth={3}
              className={activeClasses.onChip}
            />
          </span>
          <div className="min-w-0">
            <p className="textarea-xs text-gray-500 dark:text-gray-400">
              تم فعلی
            </p>
            <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
              {activeOption.label}
            </p>
          </div>
        </div>
        <div
          className={`flex h-8 items-center gap-1 rounded-lg px-2 ${activeClasses.soft} ring-1 ring-inset ${activeClasses.border}`}
          aria-hidden="true"
        >
          <span className={`h-1.5 w-8 rounded-full ${activeClasses.chip}`} />
          <span
            className={`h-1.5 w-4 rounded-full ${activeClasses.chip} opacity-60`}
          />
          <span
            className={`h-1.5 w-2 rounded-full ${activeClasses.chip} opacity-30`}
          />
        </div>
      </div>
    </div>
  );
};

export default ColorPicker;
