import React, { useEffect, useState } from "react";
import { AiFillSun } from "react-icons/ai";
import { BsMoonStarsFill } from "react-icons/bs";

/** Always default to light unless user explicitly chose dark before. */
const getInitialDark = () => {
  if (typeof window === "undefined") return false;
  const saved = localStorage.getItem("darkMode");
  if (saved === "enabled") return true;
  if (saved === "not-enabled") return false;
  // No system-preference fallback — MVP: light by default
  return false;
};

const DarkModeToggle: React.FC = () => {
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

  // Ensure light on first paint if nothing saved
  useEffect(() => {
    if (!localStorage.getItem("darkMode")) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("darkMode", "not-enabled");
    }
  }, []);

  return (
    <button
      type="button"
      onClick={() => setIsDark((v) => !v)}
      className="mb-4 rounded-full bg-gray-200 p-2 transition hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-700"
      aria-label={isDark ? "حالت روشن" : "حالت تاریک"}
    >
      {isDark ? (
        <AiFillSun className="h-6 w-6 text-yellow-500" />
      ) : (
        <BsMoonStarsFill className="h-6 w-6 text-gray-500" />
      )}
    </button>
  );
};

export default DarkModeToggle;
