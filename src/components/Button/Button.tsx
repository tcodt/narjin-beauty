import React, { ButtonHTMLAttributes, ReactNode, RefObject } from "react";
import { useThemeColor } from "../../context/ThemeColor";
import { themeBgSolid } from "../../utils/themeClasses";

type ButtonVariant =
  | "primary"
  | "secondary"
  | "add"
  | "update"
  | "delete"
  | "select"
  | "green";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: ButtonVariant;
  ref?: RefObject<HTMLButtonElement | null>;
}

const Button: React.FC<ButtonProps> = ({
  children,
  type = "button",
  variant = "primary",
  ref,
  className = "",
  ...rest
}) => {
  const { themeColor } = useThemeColor();

  const baseClasses =
    "w-full h-12 px-4 py-2 text-base font-medium rounded-full " +
    "transition-colors duration-300 " +
    "disabled:opacity-50 disabled:cursor-not-allowed " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 " +
    "dark:focus-visible:ring-offset-gray-800";

  const variantClasses: Record<ButtonVariant, string> = {
    // themeBgSolid[themeColor] is a LITERAL string like
    // "bg-primary-green-600 hover:bg-primary-green-700" — Tailwind sees it.
    primary: `${themeBgSolid[themeColor]} text-white`,

    secondary:
      "bg-gray-200 text-gray-800 hover:bg-gray-300 border-2 border-gray-300 " +
      "dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600 dark:border-gray-600",

    add:
      "bg-sky-100 text-sky-600 hover:bg-sky-200 border-2 border-sky-200 " +
      "dark:bg-sky-900/30 dark:text-sky-300 dark:hover:bg-sky-900/50 dark:border-sky-800",

    update:
      "bg-green-100 text-green-600 hover:bg-green-200 border-2 border-green-200 " +
      "dark:bg-green-900/30 dark:text-green-300 dark:hover:bg-green-900/50 dark:border-green-800",

    delete:
      "bg-red-100 text-red-600 hover:bg-red-200 border-2 border-red-200 " +
      "dark:bg-red-900/30 dark:text-red-300 dark:hover:bg-red-900/50 dark:border-red-800",

    select:
      "bg-white text-gray-500 hover:bg-slate-100 border-2 border-gray-300 border-dashed " +
      "dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 dark:border-gray-600",

    green:
      "bg-primary-green-500 text-white hover:bg-primary-green-600 border-2 border-primary-green-200",
  };

  return (
    <button
      type={type}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      ref={ref}
      {...rest}
    >
      {children}
    </button>
  );
};

export default Button;
