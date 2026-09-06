import type { ThemeColorName } from "../context/ThemeColor";

/** Full static class strings so Tailwind safelist / JIT always include them. */
export const themeGradientBar: Record<ThemeColorName, string> = {
  "primary-green":
    "bg-gradient-to-l from-primary-green-600 to-primary-green-500 dark:from-primary-green-800 dark:to-primary-green-700 shadow-primary-green-500/20",
  orange:
    "bg-gradient-to-l from-orange-600 to-orange-500 dark:from-orange-800 dark:to-orange-700 shadow-orange-500/20",
  blue: "bg-gradient-to-l from-blue-600 to-blue-500 dark:from-blue-800 dark:to-blue-700 shadow-blue-500/20",
  red: "bg-gradient-to-l from-red-600 to-red-500 dark:from-red-800 dark:to-red-700 shadow-red-500/20",
  green:
    "bg-gradient-to-l from-green-600 to-green-500 dark:from-green-800 dark:to-green-700 shadow-green-500/20",
  purple:
    "bg-gradient-to-l from-purple-600 to-purple-500 dark:from-purple-800 dark:to-purple-700 shadow-purple-500/20",
  yellow:
    "bg-gradient-to-l from-yellow-600 to-yellow-500 dark:from-yellow-700 dark:to-yellow-600 shadow-yellow-500/20",
};

export const themeText: Record<ThemeColorName, string> = {
  "primary-green": "text-primary-green-600 dark:text-primary-green-400",
  orange: "text-orange-600 dark:text-orange-400",
  blue: "text-blue-600 dark:text-blue-400",
  red: "text-red-600 dark:text-red-400",
  green: "text-green-600 dark:text-green-400",
  purple: "text-purple-600 dark:text-purple-400",
  yellow: "text-yellow-600 dark:text-yellow-400",
};

export const themeBgSoft: Record<ThemeColorName, string> = {
  "primary-green": "bg-primary-green-50 dark:bg-primary-green-900/30",
  orange: "bg-orange-50 dark:bg-orange-900/30",
  blue: "bg-blue-50 dark:bg-blue-900/30",
  red: "bg-red-50 dark:bg-red-900/30",
  green: "bg-green-50 dark:bg-green-900/30",
  purple: "bg-purple-50 dark:bg-purple-900/30",
  yellow: "bg-yellow-50 dark:bg-yellow-900/30",
};

export const themeBgSolid: Record<ThemeColorName, string> = {
  "primary-green": "bg-primary-green-600 hover:bg-primary-green-700",
  orange: "bg-orange-600 hover:bg-orange-700",
  blue: "bg-blue-600 hover:bg-blue-700",
  red: "bg-red-600 hover:bg-red-700",
  green: "bg-green-600 hover:bg-green-700",
  purple: "bg-purple-600 hover:bg-purple-700",
  yellow: "bg-yellow-600 hover:bg-yellow-700",
};

export const themeBorder: Record<ThemeColorName, string> = {
  "primary-green": "border-primary-green-500",
  orange: "border-orange-500",
  blue: "border-blue-500",
  red: "border-red-500",
  green: "border-green-500",
  purple: "border-purple-500",
  yellow: "border-yellow-500",
};

export const themeRing: Record<ThemeColorName, string> = {
  "primary-green": "ring-primary-green-200 dark:ring-primary-green-800",
  orange: "ring-orange-200 dark:ring-orange-800",
  blue: "ring-blue-200 dark:ring-blue-800",
  red: "ring-red-200 dark:ring-red-800",
  green: "ring-green-200 dark:ring-green-800",
  purple: "ring-purple-200 dark:ring-purple-800",
  yellow: "ring-yellow-200 dark:ring-yellow-800",
};

export const themeBarFill: Record<ThemeColorName, string> = {
  "primary-green": "bg-primary-green-500",
  orange: "bg-orange-500",
  blue: "bg-blue-500",
  red: "bg-red-500",
  green: "bg-green-500",
  purple: "bg-purple-500",
  yellow: "bg-yellow-500",
};

export const mediaUrl = (path?: string | null) => {
  if (!path) return "/images/no-image.jpg";
  if (path.startsWith("http")) return path;
  return `https://queuingprojectapi.pythonanywhere.com${path}`;
};
