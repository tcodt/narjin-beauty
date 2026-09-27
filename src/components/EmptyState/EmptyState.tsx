import React from "react";
import { motion } from "framer-motion";
import { useThemeColor } from "../../context/ThemeColor";
import { themeBgSolid, themeText } from "../../utils/themeClasses";

export interface EmptyStateProps {
  /** آیکون یا تصویر (ReactNode) */
  icon?: React.ReactNode;
  title: string;
  description?: string;
  /** دکمه اقدام اصلی */
  action?: {
    label: string;
    onClick: () => void;
  };
  /** دکمه ثانویه اختیاری */
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  secondaryAction,
  className = "",
}) => {
  const { themeColor } = useThemeColor();

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className={`flex flex-col items-center justify-center px-4 py-14 text-center ${className}`}
      role="status"
      aria-live="polite"
    >
      {icon ? (
        <div
          className={`mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500`}
        >
          <div className={`text-4xl ${themeText[themeColor]}`}>{icon}</div>
        </div>
      ) : null}

      <h3 className="text-base font-bold text-gray-800 dark:text-gray-100">
        {title}
      </h3>

      {description ? (
        <p className="mt-2 max-w-xs text-sm leading-6 text-gray-500 dark:text-gray-400">
          {description}
        </p>
      ) : null}

      {(action || secondaryAction) && (
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          {action ? (
            <button
              type="button"
              onClick={action.onClick}
              className={`rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition active:scale-[0.98] ${themeBgSolid[themeColor]}`}
            >
              {action.label}
            </button>
          ) : null}
          {secondaryAction ? (
            <button
              type="button"
              onClick={secondaryAction.onClick}
              className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              {secondaryAction.label}
            </button>
          ) : null}
        </div>
      )}
    </motion.div>
  );
};

export default EmptyState;
