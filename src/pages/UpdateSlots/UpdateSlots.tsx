import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { useGetSlotById } from "../../hooks/slots/useGetSlotById";
import { useUpdateSlots } from "../../hooks/slots/useUpdateSlots";
import { useGetServices } from "../../hooks/services/useGetServices";
import { GetServicesItem } from "../../types/services";
import PersianDayPicker from "../../components/PersianDayPicker/PersianDayPicker";
import PersianTimePicker from "../../components/PersianTimePicker/PersianTimePicker";
import Button from "../../components/Button/Button";
import toast from "react-hot-toast";
import Loading from "../../components/Loading/Loading";
import { useThemeColor } from "../../context/ThemeColor";
import { useQueryClient } from "@tanstack/react-query";
import { parseApiError } from "../../utils/parseApiError";

/** "14:30:00" | "14:30" → "14:30" */
function toHhMm(t: string | undefined | null): string {
  if (!t) return "";
  const m = String(t).match(/^(\d{1,2}):(\d{2})/);
  if (!m) return "";
  return `${m[1].padStart(2, "0")}:${m[2]}`;
}

const UpdateSlots: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { themeColor } = useThemeColor();

  const {
    data: slotData,
    isPending,
    isError,
    error,
  } = useGetSlotById(Number(id));
  const { data: services } = useGetServices();
  const updateSlotMutation = useUpdateSlots();

  // API contract: date = YYYY-MM-DD, time = HH:mm
  const [dateValue, setDateValue] = useState<string>("");
  const [timeValue, setTimeValue] = useState<string>("");
  const [selectedService, setSelectedService] = useState<number>(0);
  const [isAvailable, setIsAvailable] = useState(false);

  useEffect(() => {
    if (!slotData) return;
    setDateValue(slotData.date || "");
    setTimeValue(toHhMm(slotData.start_time));
    setSelectedService(slotData.service || 0);
    setIsAvailable(!!slotData.is_available);
  }, [slotData]);

  const handleUpdateSlot = () => {
    if (!dateValue) {
      toast.error("لطفاً تاریخ را انتخاب کنید.");
      return;
    }
    if (!timeValue) {
      toast.error("لطفاً ساعت را انتخاب کنید.");
      return;
    }
    if (!selectedService) {
      toast.error("لطفاً سرویس را انتخاب کنید.");
      return;
    }

    const toastId = toast.loading("در حال بروزرسانی...");
    updateSlotMutation.mutate(
      {
        id: Number(id),
        updateSlot: {
          service_id: selectedService,
          date: dateValue,
          start_time: `${timeValue}:00`,
          is_available: isAvailable,
        },
      },
      {
        onSuccess: () => {
          toast.success("زمان با موفقیت بروزرسانی شد.", { id: toastId });
          queryClient.invalidateQueries({ queryKey: ["slots"] });
          queryClient.invalidateQueries({ queryKey: ["available-times"] });
          navigate("/available-times");
        },
        onError: (err) => {
          toast.error(parseApiError(err), { id: toastId });
        },
      },
    );
  };

  if (isPending) return <Loading />;

  if (isError) {
    return (
      <div className="mx-auto max-w-md space-y-4 p-4 text-center">
        <p className="rounded-2xl bg-red-50 p-4 text-sm text-red-600 dark:bg-red-900/20">
          خطا در دریافت اطلاعات اسلات
        </p>
        <p className="text-xs text-gray-500">{parseApiError(error)}</p>
        <Button type="button" variant="secondary" onClick={() => navigate(-1)}>
          بازگشت
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md space-y-6 p-4 pb-10">
      <h1 className="text-center text-2xl font-bold text-gray-800 dark:text-white">
        ویرایش زمان
      </h1>

      <PersianDayPicker
        label="تاریخ"
        value={dateValue}
        onChange={setDateValue}
        helperText="تاریخ میلادی برای API به‌صورت خودکار ذخیره می‌شود."
      />

      <PersianTimePicker
        label="ساعت شروع"
        value={timeValue}
        onChange={setTimeValue}
        minuteStep={5}
      />

      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-200">
          سرویس
        </label>
        <select
          className="primary-input w-full"
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

      <label className="flex cursor-pointer items-center gap-2 rounded-xl bg-gray-100 px-3 py-2.5 dark:bg-gray-800">
        <input
          type="checkbox"
          id="is_available"
          checked={isAvailable}
          onChange={() => setIsAvailable((v) => !v)}
          className="h-4 w-4 accent-emerald-600"
        />
        <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
          در دسترس (قابل رزرو)
        </span>
      </label>

      <div className="flex gap-3">
        <Button
          type="button"
          onClick={handleUpdateSlot}
          disabled={updateSlotMutation.isPending}
          className={`flex-1 bg-${themeColor}-500`}
        >
          {updateSlotMutation.isPending ? "در حال بروزرسانی..." : "بروزرسانی"}
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => navigate("/available-times")}
          className="flex-1"
        >
          انصراف
        </Button>
      </div>
    </div>
  );
};

export default UpdateSlots;
