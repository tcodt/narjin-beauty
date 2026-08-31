import React, { useState } from "react";
import PersianTimePicker from "../../components/PersianTimePicker/PersianTimePicker";
import { Value } from "react-multi-date-picker";
import { FiClock } from "react-icons/fi";
import PersianDayPicker from "../../components/PersianDayPicker/PersianDayPicker";
import { FaRegCalendarAlt } from "react-icons/fa";
import Button from "../../components/Button/Button";
import { useAddWorkingTime } from "../../hooks/working-time/useAddWorkingTime";
import toast from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";
// import { useNavigate } from "react-router";

const AddWorkingTime: React.FC = () => {
  const handleWorkingTimeMutation = useAddWorkingTime();
  const queryClient = useQueryClient();

  const [openingTimeValue, setOpeningTimeValue] = useState<Value>(new Date());
  const [openingHour, setOpeningHour] = useState<number | null>(null);
  const [openingMinute, setOpeningMinute] = useState<number | null>(null);

  const [closingTimeValue, setClosingTimeValue] = useState<Value>(new Date());
  const [closingHour, setClosingHour] = useState<number | null>(null);
  const [closingMinute, setClosingMinute] = useState<number | null>(null);

  const [dayValue, setDayValue] = useState<{
    year: number;
    month: { number: number };
    day: number;
  } | null>(null);
  const [weekDay, setWeekDay] = useState<string | null>(null);
  const [day, setDay] = useState<number | null>(null);
  const [month, setMonth] = useState<string | null>(null);
  // const navigate = useNavigate();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleOpeningTimeChange = (val: any, hour: number, minute: number) => {
    setOpeningTimeValue(val);
    setOpeningHour(hour);
    setOpeningMinute(minute);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleClosingTimeChange = (val: any, hour: number, minute: number) => {
    setClosingTimeValue(val);
    setClosingHour(hour);
    setClosingMinute(minute);
  };

  const handleDayValue = (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    val: any,
    weekDay?: string,
    day?: number,
    month?: string,
  ) => {
    setDayValue(val);
    setWeekDay(weekDay ?? null);
    setDay(day ?? null);
    setMonth(month ?? null);
  };

  const handleWorkingTime = () => {
    if (
      openingHour === null ||
      openingMinute === null ||
      closingHour === null ||
      closingMinute === null ||
      dayValue === null
    ) {
      toast.error("لطفاً تمام فیلدها را پر کنید.");
      return;
    }

    const formattedDay = dayValue
      ? dayValue.year + "-" + dayValue.month.number + "-" + dayValue.day
      : null; // YYY-MM-DD

    if (!formattedDay) {
      toast.error("تاریخ انتخاب شده نامعتبر است.");
      return;
    }

    const workingTimeData = {
      day: formattedDay,
      opening_time: `${openingHour.toString().padStart(2, "0")}:${openingMinute
        .toString()
        .padStart(2, "0")}`,
      closing_time: `${closingHour.toString().padStart(2, "0")}:${closingMinute
        .toString()
        .padStart(2, "0")}`,
    };

    const toastId = toast.loading("درحال ثبت زمان کاری...");
    handleWorkingTimeMutation.mutate(workingTimeData, {
      onSuccess: () => {
        toast.success("زمان کاری با موفقیت اضافه شد.", { id: toastId });
        queryClient.invalidateQueries({
          queryKey: ["working_time"],
        });
        // navigate("/working-time");
        window.location.reload();
      },
      onError: (error) => {
        console.error("خطا در ثبت زمان کاری:", error);
        toast.error("خطایی رخ داده است. لطفاً دوباره تلاش کنید.", {
          id: toastId,
        });
      },
    });
  };

  return (
    <div className="flex flex-col gap-12">
      <div className="flex flex-col gap-4">
        <div className="flex flex-row items-center gap-4">
          <PersianTimePicker
            value={openingTimeValue}
            onChange={handleOpeningTimeChange}
            buttonLabel="ساعت باز شدن"
            buttonIcon={<FiClock size={20} />}
            bgColor="bg-green-100"
            textColor="green-500"
          />

          {openingHour !== null && openingMinute !== null && (
            <div className="bg-blue-100 text-blue-500 rounded-xl py-2 px-4">
              <p className="">
                {openingHour.toString().padStart(2, "0")}:
                {openingMinute.toString().padStart(2, "0")}
              </p>
            </div>
          )}
        </div>
        <div className="flex items-center gap-4">
          <PersianTimePicker
            value={closingTimeValue}
            onChange={handleClosingTimeChange}
            buttonLabel="ساعت بسته شدن"
            buttonIcon={<FiClock size={20} />}
            bgColor="bg-red-100"
            textColor="red-500"
          />
          {closingHour !== null && closingMinute !== null && (
            <div className="bg-red-100 text-red-500 rounded-xl py-2 px-4">
              <p className="">
                {closingHour.toString().padStart(2, "0")}:
                {closingMinute.toString().padStart(2, "0")}
              </p>
            </div>
          )}
        </div>
        <div className="flex items-center gap-4">
          <PersianDayPicker
            value={dayValue}
            onChange={handleDayValue}
            buttonIcon={<FaRegCalendarAlt size={20} />}
            buttonLabel="انتخاب روز"
            bgColor="bg-white"
            textColor="gray-500"
          />
          {weekDay !== null && day !== null && (
            <div className="bg-white text-gray-500 py-2 px-4 rounded-xl">
              <p className="">
                {weekDay} {day} {month}
              </p>
            </div>
          )}
        </div>
      </div>
      <Button type="submit" onClick={handleWorkingTime}>
        اضافه کردن
      </Button>
    </div>
  );
};

export default AddWorkingTime;
