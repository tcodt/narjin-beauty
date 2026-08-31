/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { useGetWorkingTimeById } from "../../hooks/working-time/useGetWorkingTimeById";
import { useUpdateWorkingTime } from "../../hooks/working-time/useUpdateWorkingTime";
import PersianTimePicker from "../../components/PersianTimePicker/PersianTimePicker";
import PersianDayPicker from "../../components/PersianDayPicker/PersianDayPicker";
import { FiClock } from "react-icons/fi";
import { FaRegCalendarAlt } from "react-icons/fa";
import Button from "../../components/Button/Button";
import toast from "react-hot-toast";
import Loading from "../../components/Loading/Loading";

const UpdateWorkingTime: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const {
    data: workingTime,
    isPending,
    isError,
    error,
  } = useGetWorkingTimeById(Number(id));
  const updateMutation = useUpdateWorkingTime();

  const [openingTimeValue, setOpeningTimeValue] = useState(new Date());
  const [openingHour, setOpeningHour] = useState<number | null>(null);
  const [openingMinute, setOpeningMinute] = useState<number | null>(null);

  const [closingTimeValue, setClosingTimeValue] = useState(new Date());
  const [closingHour, setClosingHour] = useState<number | null>(null);
  const [closingMinute, setClosingMinute] = useState<number | null>(null);

  const [dayValue, setDayValue] = useState<any>(null);
  const [weekDay, setWeekDay] = useState<string | null>(null);
  const [day, setDay] = useState<number | null>(null);
  // const [month, setMonth] = useState<string | null>(null);

  useEffect(() => {
    if (workingTime) {
      const [openHour, openMin] = workingTime.opening_time
        .split(":")
        .map(Number);
      const [closeHour, closeMin] = workingTime.closing_time
        .split(":")
        .map(Number);
      setOpeningHour(openHour);
      setOpeningMinute(openMin);
      setClosingHour(closeHour);
      setClosingMinute(closeMin);

      // You can customize this to convert `workingTime.day` to your calendar format
      const [year, monthStr, dayStr] = workingTime.day.split("-");
      setDayValue({
        year: Number(year),
        month: { number: Number(monthStr) },
        day: Number(dayStr),
      });
      setDay(Number(dayStr));
      // setMonth(monthStr);
      setWeekDay(workingTime.day);
    }
  }, [workingTime]);

  console.log(weekDay);
  if (isPending) return <Loading />;
  if (isError) {
    console.error(error);
    toast.error("خطا در دریافت اطلاعات");
    return null;
  }

  const handleOpeningTimeChange = (val: any, hour: number, minute: number) => {
    setOpeningTimeValue(val);
    setOpeningHour(hour);
    setOpeningMinute(minute);
  };

  const handleClosingTimeChange = (val: any, hour: number, minute: number) => {
    setClosingTimeValue(val);
    setClosingHour(hour);
    setClosingMinute(minute);
  };

  const handleDayValueChange = (
    val: any,
    weekDay?: string,
    day?: number,
    // month?: string,
  ) => {
    setDayValue(val);
    setWeekDay(weekDay ?? null);
    setDay(day ?? null);
    // setMonth(month);
  };

  const handleUpdate = () => {
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

    const formattedDay = `${dayValue.year}-${dayValue.month.number}-${dayValue.day}`;

    const toastId = toast.loading("در حال بروزرسانی...");
    updateMutation.mutate(
      {
        id: Number(id),
        data: {
          day: formattedDay,
          opening_time: `${openingHour
            .toString()
            .padStart(2, "0")}:${openingMinute.toString().padStart(2, "0")}`,
          closing_time: `${closingHour
            .toString()
            .padStart(2, "0")}:${closingMinute.toString().padStart(2, "0")}`,
        },
      },
      {
        onSuccess: () => {
          toast.success("زمان کاری با موفقیت بروزرسانی شد.", { id: toastId });
          navigate("/working-time");
        },
        onError: (error) => {
          console.error("خطا در بروزرسانی زمان کاری:", error);
          toast.error("خطایی رخ داد. لطفاً دوباره تلاش کنید.", { id: toastId });
        },
      },
    );
  };

  return (
    <div className="flex flex-col gap-12">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <PersianTimePicker
            value={openingTimeValue}
            onChange={handleOpeningTimeChange}
            buttonLabel="ساعت باز شدن"
            buttonIcon={<FiClock size={20} />}
            bgColor="bg-blue-100"
            textColor="text-blue-500"
          />
          {openingHour !== null && openingMinute !== null && (
            <div className="bg-blue-100 text-blue-500 rounded-xl py-2 px-4">
              <p>
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
            textColor="text-red-500"
          />
          {closingHour !== null && closingMinute !== null && (
            <div className="bg-red-100 text-red-500 rounded-xl py-2 px-4">
              <p>
                {closingHour.toString().padStart(2, "0")}:
                {closingMinute.toString().padStart(2, "0")}
              </p>
            </div>
          )}
        </div>

        <div className="flex items-center gap-4">
          <PersianDayPicker
            value={dayValue}
            onChange={handleDayValueChange}
            buttonIcon={<FaRegCalendarAlt size={20} />}
            buttonLabel="انتخاب روز"
            bgColor="bg-gray-100"
            textColor="text-gray-500"
          />
          {weekDay !== null && day !== null && (
            <div className="bg-gray-100 text-gray-500 py-2 px-4 rounded-xl">
              <p>{weekDay}</p>
            </div>
          )}
        </div>
      </div>

      <Button type="submit" onClick={handleUpdate}>
        بروزرسانی
      </Button>
    </div>
  );
};

export default UpdateWorkingTime;
