import React, { useEffect, useState } from "react";
import { AiFillSun } from "react-icons/ai";
import { BsMoonStarsFill } from "react-icons/bs";

/** Always default to light unless user explicitly chose dark before. */
const getInitialDark = (): boolean => {
  if (typeof window === "undefined") return false;
  const saved = localStorage.getItem("darkMode");
  if (saved === "enabled") return true;
  if (saved === "not-enabled") return false;
  return false;
};

interface DarkModeToggleProps {
  /** compact = icon button for TopBar (no extra margin) */
  variant?: "default" | "compact";
}

const DarkModeToggle: React.FC<DarkModeToggleProps> = ({
  variant = "default",
}) => {
  const [isDark, setIsDark] = useState(getInitialDark);

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDark) {
      root.classList.add("dark");
      localStorage.setItem("darkMode", "enabled");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("darkMode", "not-enabled");
    }
  }, [isDark]);

  // First paint: force light if nothing saved
  useEffect(() => {
    if (!localStorage.getItem("darkMode")) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("darkMode", "not-enabled");
    }
  }, []);

  const isCompact = variant === "compact";

  return (
    <button
      type="button"
      onClick={() => setIsDark((v) => !v)}
      className={
        isCompact
          ? "flex h-10 w-10 items-center justify-center rounded-xl text-white/95 transition hover:bg-white/15 active:scale-95"
          : "rounded-full bg-gray-200 p-2 transition hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-700"
      }
      aria-label={isDark ? "حالت روشن" : "حالت تاریک"}
      title={isDark ? "حالت روشن" : "حالت تاریک"}
    >
      {isDark ? (
        <AiFillSun
          className={
            isCompact ? "h-5 w-5 text-yellow-300" : "h-6 w-6 text-yellow-500"
          }
        />
      ) : (
        <BsMoonStarsFill
          className={
            isCompact ? "h-5 w-5 text-white/90" : "h-6 w-6 text-gray-500"
          }
        />
      )}
    </button>
  );
};

export default DarkModeToggle;
