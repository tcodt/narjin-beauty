import React from "react";
import { useThemeColor } from "../../context/ThemeColor";
import { themeBgSoft, themeBgSolid, themeText } from "../../utils/themeClasses";

interface SettingsSectionCardProps {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  title: string;
  description: string;
  children: React.ReactNode;
  /** Optional id for skip-link / aria-labelledby */
  headingId?: string;
}

export const SettingsSectionCard: React.FC<SettingsSectionCardProps> = ({
  icon: Icon,
  title,
  description,
  children,
  headingId,
}) => {
  const { themeColor } = useThemeColor();

  return (
    <section className="relative overflow-hidden rounded-3xl border border-gray-100 bg-linear-to-br from-white to-gray-50/60 p-5 shadow-sm dark:border-gray-800 dark:from-gray-900 dark:to-gray-900/60">
      {/* Accent stripe — theme color */}
      <span
        aria-hidden="true"
        className={`absolute inset-y-0 right-0 w-1 opacity-90 ${themeBgSolid[themeColor]}`}
      />

      <div className="mb-5 flex items-start gap-3">
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl shadow-inner ring-1 ring-black/5 dark:ring-white/10 ${themeBgSoft[themeColor]} ${themeText[themeColor]}`}
        >
          <Icon size={20} aria-hidden="true" />
        </div>
        <div>
          <h2
            id={headingId}
            className="text-base font-bold tracking-tight text-gray-900 dark:text-white"
          >
            {title}
          </h2>
          <p className="mt-0.5 text-xs leading-5 text-gray-500 dark:text-gray-400">
            {description}
          </p>
        </div>
      </div>

      {children}
    </section>
  );
};
