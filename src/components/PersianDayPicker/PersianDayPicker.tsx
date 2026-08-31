import React, { ReactNode } from "react";
import DatePicker, { DateObject } from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import "react-multi-date-picker/styles/layouts/mobile.css";

const weekDays = ["ش", "ی", "د", "س", "چ", "پ", "ج"];

interface PersianDayPickerType {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: any;
  onChange: (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    value: any,
    weekDay?: string,
    day?: number,
    month?: string,
  ) => void;
  buttonLabel?: string;
  buttonIcon?: ReactNode;
  bgColor?: string;
  textColor?: string;
  selectedRed?: boolean;
  minDate?: Date | DateObject;
  maxDate?: Date | DateObject;
  /** Optional list of allowed dates (YYYY/MM/DD or YYYY-MM-DD) */
  enabledDates?: string[];
  helperText?: string;
}

function toComparableKey(date: DateObject): string {
  try {
    return date.format("YYYY/MM/DD");
  } catch {
    return "";
  }
}

function normalizeEnabledSet(enabledDates?: string[]): Set<string> | null {
  if (!enabledDates || enabledDates.length === 0) return null;
  const set = new Set<string>();
  for (const raw of enabledDates) {
    if (!raw) continue;
    const t = raw.trim();
    set.add(t);
    set.add(t.replace(/-/g, "/"));
    set.add(t.replace(/\//g, "-"));
  }
  return set;
}

const PersianDayPicker: React.FC<PersianDayPickerType> = ({
  value,
  onChange,
  buttonLabel,
  buttonIcon,
  bgColor = "bg-white",
  textColor = "gray-700",
  selectedRed = true,
  minDate,
  maxDate,
  enabledDates,
  helperText,
}) => {
  const enabledSet = normalizeEnabledSet(enabledDates);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleChange = (val: any) => {
    if (!val) {
      onChange(val);
      return;
    }
    onChange(val, val?.weekDay?.name, val?.day, val?.month?.name);
  };

  return (
    <div className="w-full">
      <DatePicker
        weekDays={weekDays}
        calendar={persian}
        locale={persian_fa}
        className="rmdp-mobile"
        calendarPosition="bottom-right"
        value={value}
        onChange={handleChange}
        minDate={minDate}
        maxDate={maxDate}
        mapDays={({ date, selectedDate }) => {
          const key = toComparableKey(date);
          const isSelected =
            selectedDate && key === toComparableKey(selectedDate as DateObject);

          if (enabledSet) {
            const allowed =
              enabledSet.has(key) || enabledSet.has(key.replace(/\//g, "-"));

            if (!allowed) {
              return {
                disabled: true,
                style: { color: "#c4c4c4", opacity: 0.45 },
              };
            }

            return {
              style: {
                backgroundColor: isSelected ? "#059669" : "#d1fae5",
                color: isSelected ? "#fff" : "#065f46",
                borderRadius: "10px",
                fontWeight: 700,
              },
            };
          }

          if (isSelected && selectedRed) {
            return {
              style: {
                backgroundColor: "#e11d48",
                color: "#fff",
                borderRadius: "10px",
                fontWeight: 700,
              },
            };
          }

          if (isSelected && !selectedRed) {
            return {
              style: {
                backgroundColor: "#059669",
                color: "#fff",
                borderRadius: "10px",
                fontWeight: 700,
              },
            };
          }

          return {};
        }}
        render={(_value, openCalendar) => (
          <button
            type="button"
            onClick={openCalendar}
            className={`flex w-full items-center justify-between gap-2 rounded-xl border border-gray-200 py-2.5 px-4 text-base font-medium ${bgColor} text-${textColor} dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100`}
          >
            <span className="flex items-center gap-2">
              {buttonIcon}
              {buttonLabel}
            </span>
            <span className="text-xs text-gray-400">تقویم شمسی</span>
          </button>
        )}
      />
      {helperText ? (
        <p className="mt-1.5 text-[11px] leading-5 text-gray-400">
          {helperText}
        </p>
      ) : null}
    </div>
  );
};

export default PersianDayPicker;
