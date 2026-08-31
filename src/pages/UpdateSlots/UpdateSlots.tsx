/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { useGetSlotById } from "../../hooks/slots/useGetSlotById";
import { useUpdateSlots } from "../../hooks/slots/useUpdateSlots";
import { useGetServices } from "../../hooks/services/useGetServices";
import { GetServicesItem } from "../../types/services";
import PersianDayPicker from "../../components/PersianDayPicker/PersianDayPicker";
import Button from "../../components/Button/Button";
import { FiClock } from "react-icons/fi";
import { FaRegCalendarAlt } from "react-icons/fa";
import toast from "react-hot-toast";
import Loading from "../../components/Loading/Loading";
import PersianTimePicker from "../../components/PersianTimePicker/PersianTimePicker";
import DateObject from "react-date-object";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import { useThemeColor } from "../../context/ThemeColor";
import { useQueryClient } from "@tanstack/react-query";

interface TimeSelection {
  hour: number;
  minute: number;
}

interface DateSelection {
  year: number;
  month: number;
  day: number;
}

const UpdateSlots: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const {
    data: slotData,
    isPending,
    isError,
    error,
  } = useGetSlotById(Number(id));
  const { data: services } = useGetServices();
  const updateSlotMutation = useUpdateSlots();
  const { themeColor } = useThemeColor();

  // Update the useState for startTime to also store a timeValue for the picker
  const [timeValue, setTimeValue] = useState<any>(null);
  const [dateValue, setDateValue] = useState<any>(null);
  const [dateParts, setDateParts] = useState<DateSelection>({
    year: 0,
    month: 0,
    day: 0,
  });
  const [startTime, setStartTime] = useState<TimeSelection>({
    hour: 0,
    minute: 0,
  });
  const [selectedService, setSelectedService] = useState<number>(0);
  const [isAvailable, setIsAvailable] = useState<boolean>(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (slotData) {
      // Parse the time from the existing data
      const timeParts = slotData.start_time.split(":");
      const hour = parseInt(timeParts[0]);
      const minute = parseInt(timeParts[1]);

      // Parse Gregorian date from API (YYYY-MM-DD) and convert to Persian DateObject
      const gregorianParts = slotData.date.split("-");
      const gregorianDate = new Date(
        parseInt(gregorianParts[0]),
        parseInt(gregorianParts[1]) - 1,
        parseInt(gregorianParts[2]),
      );
      const persianDate = new DateObject({
        date: gregorianDate,
        calendar: persian,
        locale: persian_fa,
      });

      // Create a DateObject for the time picker
      const timeObj = new DateObject();
      timeObj.hour = hour;
      timeObj.minute = minute;

      setStartTime({ hour, minute });
      setTimeValue(timeObj);
      setDateValue(persianDate);
      setSelectedService(slotData.service);
      setIsAvailable(slotData.is_available);
    }
  }, [slotData]);

  const handleDateChange = (
    value: any,
    _weekDay: string,
    day: number,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _month: string
  ) => {
    setDateValue(value);

    // Store Persian values for display (YYYY/MM/DD in Persian calendar)
    const year = value?.year || 0;
    const monthNumber =
      typeof value?.month?.number === "number" ? value.month.number : 0;

    setDateParts({ year, month: monthNumber, day });
  };

  const handleTimeChange = (value: any, hour: number, minute: number) => {
    // console.log("Time changed:", value, hour, minute); // Debug log
    if (
      value &&
      typeof value.hour === "number" &&
      typeof value.minute === "number"
    ) {
      setTimeValue(value);
      setStartTime({ hour: value.hour, minute: value.minute });
    } else if (hour !== undefined && minute !== undefined) {
      // Create a new DateObject for display
      const newTimeValue = new DateObject();
      newTimeValue.hour = hour;
      newTimeValue.minute = minute;
      setTimeValue(newTimeValue);
      setStartTime({ hour, minute });
    }
  };

  // Format date as Gregorian YYYY-MM-DD for the API
  const formatDateForAPI = (): string => {
    if (!dateValue) return "";

    // Convert Persian DateObject → Gregorian JS Date
    const jsDate = dateValue.toDate();
    const y = jsDate.getFullYear();
    const m = String(jsDate.getMonth() + 1).padStart(2, "0");
    const d = String(jsDate.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  const handleUpdateSlot = () => {
    if (!dateValue) {
      toast.error("لطفاً تاریخ را انتخاب کنید.");
      return;
    }

    if (selectedService === 0) {
      toast.error("لطفاً سرویس را انتخاب کنید.");
      return;
    }

    const formattedDate = formatDateForAPI();
    const formattedTime = `${startTime.hour
      .toString()
      .padStart(2, "0")}:${startTime.minute.toString().padStart(2, "0")}`;

    const updatedSlotData = {
      service_id: selectedService,
      date: formattedDate,
      start_time: formattedTime,
      is_available: isAvailable,
    };

    const toastId = toast.loading("در حال بروزرسانی...");
    updateSlotMutation.mutate(
      { updateSlot: updatedSlotData, id: Number(id) },
      {
        onSuccess: () => {
          toast.success("زمان با موفقیت بروزرسانی شد.", { id: toastId });
          navigate("/available-times");
          queryClient.invalidateQueries({ queryKey: ["slots"] });
        },
        onError: (error) => {
          console.error("خطا در بروزرسانی زمان:", error);
          toast.error("خطایی رخ داد. لطفاً دوباره تلاش کنید.", { id: toastId });
        },
      }
    );
  };

  if (isPending) return <Loading />;
  if (isError) {
    console.error(error);
    toast.error("خطا در دریافت اطلاعات");
    return null;
  }

  return (
    <div className="max-w-md mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6 text-center">ویرایش زمان</h1>

      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-4">
          <PersianDayPicker
            value={dateValue}
            onChange={handleDateChange}
            buttonIcon={<FaRegCalendarAlt size={20} />}
            buttonLabel="انتخاب تاریخ"
            bgColor="bg-white"
            textColor="text-gray-700"
          />
          {dateParts.year && dateParts.month && dateParts.day && (
            <div className="bg-gray-100 text-gray-700 py-2 px-4 rounded-xl">
              <p>{`${dateParts.year}/${dateParts.month}/${dateParts.day}`}</p>
            </div>
          )}
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-4">
            <PersianTimePicker
              value={timeValue}
              onChange={handleTimeChange}
              buttonIcon={<FiClock size={20} />}
              buttonLabel="انتخاب زمان"
              bgColor="bg-white"
              textColor="text-gray-700"
            />
            {timeValue ? (
              <div className="bg-gray-100 text-gray-700 py-2 px-4 rounded-xl">
                <p>
                  {timeValue.format
                    ? timeValue.format("HH:mm")
                    : `${timeValue.hour}:${timeValue.minute}`}
                </p>
              </div>
            ) : startTime.hour !== 0 || startTime.minute !== 0 ? (
              <div className="bg-gray-100 text-gray-700 py-2 px-4 rounded-xl">
                <p>{`${startTime.hour
                  .toString()
                  .padStart(2, "0")}:${startTime.minute
                  .toString()
                  .padStart(2, "0")}`}</p>
              </div>
            ) : null}
          </div>

          {/* <div className="flex items-center gap-2 py-2 px-4 rounded-xl bg-gray-100 text-gray-700">
            <FiClock size={20} />
            <span>ساعت شروع:</span>
            <input
              type="number"
              min="0"
              max="23"
              value={startTime.hour}
              onChange={(e) =>
                handleTimeChange(
                  parseInt(e.target.value) || 0,
                  startTime.minute
                )
              }
              className="w-12 px-2 py-1 border rounded"
            />
            :
            <input
              type="number"
              min="0"
              max="59"
              value={startTime.minute}
              onChange={(e) =>
                handleTimeChange(startTime.hour, parseInt(e.target.value) || 0)
              }
              className="w-12 px-2 py-1 border rounded"
            />
          </div> */}
        </div>

        <div>
          <label className="block mb-2 font-medium">سرویس</label>
          <select
            className="w-full p-3 border border-gray-300 rounded-xl bg-white"
            value={selectedService}
            onChange={(e) => setSelectedService(Number(e.target.value))}
          >
            <option value={0}>انتخاب سرویس</option>
            {services?.map((service: GetServicesItem) => (
              <option key={service.id} value={service.id}>
                {service.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2 p-3 bg-gray-100 rounded-xl">
          <input
            type="checkbox"
            id="is_available"
            checked={isAvailable}
            onChange={() => setIsAvailable(!isAvailable)}
            className="w-4 h-4"
          />
          <label htmlFor="is_available" className="text-sm font-medium">
            در دسترس
          </label>
        </div>

        <div className="flex gap-3 mt-4">
          <Button
            onClick={handleUpdateSlot}
            disabled={updateSlotMutation.isPending}
            className={`flex-1 py-3 bg-${themeColor}-500 text-white rounded-full hover:bg-opacity-50 transition-opacity`}
          >
            {updateSlotMutation.isPending ? "در حال بروزرسانی..." : "بروزرسانی"}
          </Button>
          <Button
            onClick={() => navigate("/available-times")}
            variant="secondary"
            className="flex-1 py-3 bg-gray-300 rounded-full hover:bg-opacity-50 transition-opacity"
          >
            انصراف
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UpdateSlots;
