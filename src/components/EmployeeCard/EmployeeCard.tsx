import React from "react";
import { FaUser } from "react-icons/fa";
import {
  EmployeeUser,
  getEmployeeDisplayName,
  getEmployeeImage,
} from "../../types/employees";
import { themeText } from "../../utils/themeClasses";

interface EmployeeCardProps {
  employee: {
    id: number;
    user: EmployeeUser;
    skill?: string;
  };
  actionIcon: React.ReactNode;
  onAction: () => void;
  themeColor: keyof typeof themeText;
}

const EmployeeCard: React.FC<EmployeeCardProps> = ({
  employee,
  actionIcon,
  onAction,
  themeColor,
}) => {
  const name = getEmployeeDisplayName(employee.user);
  const image = getEmployeeImage(employee.user);
  const skill = employee.skill?.trim();

  const src =
    image &&
    (image.startsWith("http")
      ? image
      : `https://queuingprojectapi.pythonanywhere.com${image}`);

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-white p-3 shadow-sm dark:border-gray-600 dark:bg-gray-700">
      <div
        className={`flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-${themeColor}-50 ${themeText[themeColor]}`}
      >
        {src ? (
          <img src={src} alt={name} className="h-full w-full object-cover" />
        ) : (
          <FaUser size={18} />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <h4 className="truncate text-sm font-bold text-gray-900 dark:text-white">
          {name}
        </h4>
        <p className="truncate text-xs text-gray-500 dark:text-gray-300">
          {skill || "بدون مهارت ثبت‌شده"}
        </p>
      </div>

      <button
        type="button"
        onClick={onAction}
        className={`flex h-9 w-9 items-center justify-center rounded-full bg-${themeColor}-100 ${themeText[themeColor]} transition hover:bg-${themeColor}-200`}
        aria-label="عملیات"
      >
        {actionIcon}
      </button>
    </div>
  );
};

export default EmployeeCard;
