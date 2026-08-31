import React, { ReactNode } from "react";
import DatePicker, { DateObject } from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import "react-multi-date-picker/styles/layouts/mobile.css";

const weekDays = ["ش", "ی", "د", "س", "چ", "پ", "ج"];

interface PersianDayPickerType {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onChange: (value: any, weekDay: string, day: number, month: string) => void;
  buttonLabel?: string;
  buttonIcon?: ReactNode;
  bgColor?: string;
  textColor?: string;
  /** Highlight selected day in red */
  selectedRed?: boolean;
  minDate?: Date | DateObject;
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
}) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleChange = (val: any) => {
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
        mapDays={({ date, selectedDate }) => {
          const isSelected =
            selectedDate &&
            date.format?.("YYYY/MM/DD") ===
              (selectedDate as DateObject)?.format?.("YYYY/MM/DD");

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
    </div>
  );
};

export default PersianDayPicker;
