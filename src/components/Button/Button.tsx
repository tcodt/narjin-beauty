import React, { ButtonHTMLAttributes, ReactNode } from "react";
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
}

const Button: React.FC<ButtonProps> = ({
  children,
  type = "button",
  variant = "primary",
  ...rest
}) => {
  const { themeColor } = useThemeColor();
  const baseClasses =
    "px-4 h-12 py-2 font-medium transition-colors w-full disabled:opacity-50 disabled:cursor-not-allowed";

  const variantClasses = {
    primary: `w-full h-12 bg-${themeColor}-500 text-white text-base font-medium rounded-full px-4 py-2 cursor-pointer transition-colors duration-300 hover:${themeBgSolid[themeColor]}`,
    secondary:
      "bg-gray-200 text-gray-800 hover:bg-gray-300 border-2 border-gray-300 rounded-full",
    add: "bg-sky-100 text-sky-500 hover:bg-sky-200 border-2 border-sky-200 rounded-full",
    update:
      "bg-green-100 text-green-500 hover:bg-green-200 border-2 border-green-200 rounded-full",
    delete:
      "bg-red-100 text-red-500 hover:bg-red-200 border-2 border-red-200 rounded-full",
    select:
      "bg-white text-gray-500 hover:bg-slate-100 border-2 border-gray-300 rounded-xl border-dashed",
    green:
      "bg-primary-green-500 text-white hover:bg-primary-green-600 border-2 border-primary-green-200 rounded-full",
  };

  const buttonClasses = `${baseClasses} ${variantClasses[variant]}`;

  return (
    <button type={type} className={buttonClasses} {...rest}>
      {children}
    </button>
  );
};

export default Button;
