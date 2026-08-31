import React, { ReactNode, useMemo } from "react";
import DatePicker, { DateObject } from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import gregorian from "react-date-object/calendars/gregorian";
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
  highlightedDates?: string[];
  enabledDates?: string[];
  lockToHighlighted?: boolean;
  helperText?: string;
}

function toPersianKey(date: DateObject): string {
  try {
    return date.format("YYYY/MM/DD");
  } catch {
    return "";
  }
}

function toGregorianISOFromPicker(date: DateObject): string {
  try {
    const g = new DateObject(date).convert(gregorian);
    const y = g.year;
    const m = String(g.month.number).padStart(2, "0");
    const d = String(g.day).padStart(2, "0");
    return `${y}-${m}-${d}`;
  } catch {
    return "";
  }
}

function buildHighlightSet(dates?: string[]): Set<string> {
  const set = new Set<string>();
  if (!dates?.length) return set;

  for (const raw of dates) {
    if (!raw) continue;
    const t = raw.trim();
    set.add(t);
    set.add(t.replace(/-/g, "/"));
    set.add(t.replace(/\//g, "-"));

    if (/^\d{4}-\d{2}-\d{2}$/.test(t)) {
      try {
        const [y, m, d] = t.split("-").map(Number);
        const g = new DateObject({
          calendar: gregorian,
          year: y,
          month: m,
          day: d,
        });
        const p = g.convert(persian).setLocale(persian_fa).format("YYYY/MM/DD");
        set.add(p);
        set.add(p.replace(/\//g, "-"));
      } catch {
        /* ignore */
      }
    }
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
  highlightedDates,
  enabledDates,
  lockToHighlighted = false,
  helperText,
}) => {
  const highlightSet = useMemo(
    () =>
      buildHighlightSet(
        highlightedDates?.length ? highlightedDates : enabledDates,
      ),
    [highlightedDates, enabledDates],
  );
  const hasHighlights = highlightSet.size > 0;

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
          const persianKey = toPersianKey(date);
          const gregKey = toGregorianISOFromPicker(date);
          const isSelected =
            !!selectedDate &&
            persianKey === toPersianKey(selectedDate as DateObject);

          const isHighlighted =
            hasHighlights &&
            (highlightSet.has(persianKey) ||
              highlightSet.has(gregKey) ||
              highlightSet.has(persianKey.replace(/\//g, "-")));

          if (hasHighlights && lockToHighlighted && !isHighlighted) {
            return {
              disabled: true,
              style: { color: "#c4c4c4", opacity: 0.4 },
            };
          }

          if (isSelected) {
            return {
              style: {
                backgroundColor: selectedRed ? "#e11d48" : "#059669",
                color: "#fff",
                borderRadius: "10px",
                fontWeight: 700,
              },
            };
          }

          if (isHighlighted) {
            return {
              style: {
                backgroundColor: "#a7f3d0",
                color: "#065f46",
                borderRadius: "10px",
                fontWeight: 700,
                boxShadow: "inset 0 0 0 1px #34d399",
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
