import React from "react";
import { IoSearchOutline, IoCloseCircle } from "react-icons/io5";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  /** اختیاری: تعداد نتایج بعد از فیلتر */
  resultCount?: number;
  totalCount?: number;
}

const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  placeholder = "جستجو...",
  className = "",
  resultCount,
  totalCount,
}) => {
  return (
    <div className={`space-y-1.5 ${className}`}>
      <div className="relative">
        <IoSearchOutline
          className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400"
          aria-hidden
        />
        <input
          type="search"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="primary-input !pr-10 !pl-10"
          autoComplete="off"
          enterKeyHint="search"
        />
        {value ? (
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            aria-label="پاک کردن جستجو"
          >
            <IoCloseCircle className="h-5 w-5" />
          </button>
        ) : null}
      </div>
      {typeof resultCount === "number" &&
      typeof totalCount === "number" &&
      value.trim() ? (
        <p className="text-xs text-gray-400">
          {resultCount === 0
            ? "نتیجه‌ای یافت نشد"
            : `${resultCount.toLocaleString("fa-IR")} از ${totalCount.toLocaleString("fa-IR")} مورد`}
        </p>
      ) : null}
    </div>
  );
};

export default SearchBar;
