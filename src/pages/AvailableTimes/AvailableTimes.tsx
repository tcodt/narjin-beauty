import React, { FormEvent, useMemo, useState } from "react";
import PageTitle from "../../components/PageTitle/PageTitle";
import { useGetSlots } from "../../hooks/slots/useGetSlots";
import { SlotsResponse } from "../../types/slots";
import CustomModal from "../../components/CustomModal/CustomModal";
import toast from "react-hot-toast";
import Dots from "../../components/Dots/Dots";
import { useAddSlots } from "../../hooks/slots/useAddSlots";
import { useGetServices } from "../../hooks/services/useGetServices";
import { GetServicesItem } from "../../types/services";
import PersianDayPicker from "../../components/PersianDayPicker/PersianDayPicker";
import PersianTimePicker from "../../components/PersianTimePicker/PersianTimePicker";
import Button from "../../components/Button/Button";
import { useThemeColor } from "../../context/ThemeColor";
import { useQueryClient } from "@tanstack/react-query";
import { FaPencil, FaTrashCan } from "react-icons/fa6";
import { useUpdateSlots } from "../../hooks/slots/useUpdateSlots";
import { useRemoveSlots } from "../../hooks/slots/useRemoveSlots";
import Dropdown from "../../components/Dropdown/Dropdown";
import { motion } from "framer-motion";
import { formatTime, toPersianLabel } from "../../utils/date";
import { isoToJalali, todayIso, toPersianDigits } from "../../utils/jalali";
import { useHasFeature } from "../../hooks/subscription/useHasFeature";
import FeatureLocked from "../../components/FeatureLocked/FeatureLocked";
import Loading from "../../components/Loading/Loading";
import { themeText } from "../../utils/themeClasses";
import { parseApiError } from "../../utils/parseApiError";
import { FEATURE } from "../../constants/featureRoutes";

const parentVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.05 },
  },
};

const childrenVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
};

const formatJalali = (iso: string) => {
  const j = isoToJalali(iso);
  if (!j) return iso;
  return `${toPersianDigits(j.jy)}/${toPersianDigits(
    String(j.jm).padStart(2, "0"),
  )}/${toPersianDigits(String(j.jd).padStart(2, "0"))}`;
};

const AvailableTimes: React.FC = () => {
  // 👇 string state
  const [dateValue, setDateValue] = useState<string>(todayIso());
  const [startTimeValue, setStartTimeValue] = useState<string>("09:00");
  const [selectedService, setSelectedService] = useState<number>(0);
  const [selectedSlot, setSelectedSlot] = useState<SlotsResponse | null>(null);

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isAvailable, setIsAvailable] = useState(true);
  const [filteredSlots, setFilteredSlots] = useState<
    "all" | "available" | "unavailable"
  >("all");

  const { hasFeature, isLoading: featureLoading } = useHasFeature(
    FEATURE.appointments,
  );

  const { data: slots, isPending, isError } = useGetSlots();
  const addSlotMutation = useAddSlots();
  const updateSlotMutation = useUpdateSlots();
  const removeSlotMutation = useRemoveSlots();
  const { data: services } = useGetServices();
  const { themeColor } = useThemeColor();
  const queryClient = useQueryClient();

  const handleAddSlot = (e: React.FormEvent) => {
    e.preventDefault();

    if (!dateValue || !selectedService) {
      toast.error("لطفا تاریخ و سرویس را انتخاب کنید");
      return;
    }
    if (!startTimeValue) {
      toast.error("ساعت شروع را انتخاب کنید");
      return;
    }

    const payload = {
      service_id: selectedService,
      date: dateValue, // already "YYYY-MM-DD"
      start_time: `${startTimeValue}:00`, // "HH:mm" → "HH:mm:ss"
      is_available: isAvailable,
    };

    const toastId = toast.loading("در حال افزودن زمان...");

    addSlotMutation.mutate(payload, {
      onSuccess: () => {
        toast.success("زمان آزاد ثبت شد", { id: toastId });
        queryClient.invalidateQueries({ queryKey: ["slots"] });
        queryClient.invalidateQueries({ queryKey: ["available-times"] });
        setIsAddOpen(false);
        setDateValue(todayIso());
        setStartTimeValue("09:00");
        setSelectedService(0);
        setIsAvailable(true);
      },
      onError: (err) => {
        toast.error(parseApiError(err), { id: toastId });
      },
    });
  };

  const openEditSlot = (slot: SlotsResponse) => {
    setSelectedSlot(slot);
    setSelectedService(slot.service || 0);
    setIsAvailable(!!slot.is_available);

    // date: already "YYYY-MM-DD"
    setDateValue(slot.date || todayIso());

    // time: normalize "HH:mm:ss" or "HH:mm" → "HH:mm"
    const hhmm = String(slot.start_time ?? "09:00").slice(0, 5);
    setStartTimeValue(/^\d{2}:\d{2}$/.test(hhmm) ? hhmm : "09:00");

    setIsUpdateOpen(true);
  };

  const handleUpdateSlot = (e: FormEvent) => {
    e.preventDefault();
    if (!selectedSlot) return;

    updateSlotMutation.mutate(
      {
        id: selectedSlot.id,
        updateSlot: {
          service_id: selectedService || selectedSlot.service,
          date: dateValue || selectedSlot.date,
          start_time: startTimeValue
            ? `${startTimeValue}:00`
            : selectedSlot.start_time,
          is_available: isAvailable,
        },
      },
      {
        onSuccess: () => {
          toast.success("زمان بروزرسانی شد");
          queryClient.invalidateQueries({ queryKey: ["slots"] });
          setIsUpdateOpen(false);
          setSelectedSlot(null);
        },
        onError: (err) => {
          toast.error(parseApiError(err));
        },
      },
    );
  };

  const handleRemoveSlot = (id: number) => {
    const slotId = toast.loading("درحال حذف زمان...");
    removeSlotMutation.mutate(id, {
      onSuccess: () => {
        toast.success("زمان حذف شد", { id: slotId });
        queryClient.invalidateQueries({ queryKey: ["slots"] });
      },
      onError: (err) => {
        toast.error(parseApiError(err), { id: slotId });
      },
    });
  };

  const filteredSlotsArray = useMemo(() => {
    if (!slots) return [];
    switch (filteredSlots) {
      case "available":
        return slots.filter((slot) => slot.is_available);
      case "unavailable":
        return slots.filter((slot) => !slot.is_available);
      default:
        return slots;
    }
  }, [slots, filteredSlots]);

  const allSlotsCount = slots?.length || 0;
  const availableSlotsCount =
    slots?.filter((slot) => slot.is_available).length || 0;
  const unavailableSlotsCount =
    slots?.filter((slot) => !slot.is_available).length || 0;

  const freeSlots = slots?.filter((s) => s.is_available);

  if (featureLoading) return <Loading />;

  if (!hasFeature) {
    return (
      <FeatureLocked
        title="زمان‌های در دسترس در پلن شما فعال نیست"
        description="برای تعریف و مدیریت زمان‌های رزرو، پلن مناسب را از صفحه پلن‌ها تهیه کنید."
      />
    );
  }

  return (
    <section className="space-y-6 pb-10">
      {/* ==================== ADD MODAL ==================== */}
      <CustomModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="افزودن زمان آزاد"
      >
        <form onSubmit={handleAddSlot} className="space-y-4">
          <p className="rounded-xl bg-emerald-50 px-3 py-2 text-xs leading-5 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200">
            تاریخ را شمسی انتخاب کنید؛ برای سرور به‌صورت میلادی (YYYY-MM-DD)
            ذخیره می‌شود.
          </p>

          <PersianDayPicker
            variant="inline"
            label="تاریخ"
            value={dateValue}
            onChange={setDateValue}
            helperText={
              dateValue
                ? `شمسی: ${formatJalali(dateValue)} · میلادی: ${dateValue}`
                : "یک روز را از تقویم انتخاب کنید"
            }
          />

          <PersianTimePicker
            variant="inline"
            label="ساعت شروع"
            value={startTimeValue}
            onChange={setStartTimeValue}
            clearable={false}
          />

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-200">
              سرویس
            </label>
            <select
              className="primary-input"
              required
              value={selectedService}
              onChange={(e) => setSelectedService(Number(e.target.value))}
            >
              <option value={0}>انتخاب سرویس</option>
              {services?.map((s: GetServicesItem) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50/60 px-3 py-2.5 dark:border-emerald-900 dark:bg-emerald-900/20">
            <input
              type="checkbox"
              checked={isAvailable}
              onChange={() => setIsAvailable((v) => !v)}
              className="h-4 w-4 accent-emerald-600"
            />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
              قابل رزرو (آزاد)
            </span>
          </label>

          <Button type="submit" disabled={addSlotMutation.isPending}>
            {addSlotMutation.isPending ? "در حال افزودن..." : "ثبت زمان آزاد"}
          </Button>
        </form>
      </CustomModal>

      {/* ==================== UPDATE MODAL ==================== */}
      <CustomModal
        isOpen={isUpdateOpen}
        onClose={() => {
          setIsUpdateOpen(false);
          setSelectedSlot(null);
        }}
        title="بروزرسانی زمان"
      >
        {!selectedSlot && (
          <div className="mb-4 space-y-2">
            <p className="text-xs text-gray-500">
              یک زمان را برای ویرایش انتخاب کنید:
            </p>
            {freeSlots && freeSlots.length > 0 ? (
              freeSlots.map((slot) => (
                <button
                  key={slot.id}
                  type="button"
                  onClick={() => openEditSlot(slot)}
                  className="flex w-full items-center justify-between rounded-xl border border-gray-100 bg-slate-50 p-3 text-right dark:border-gray-600 dark:bg-gray-700"
                >
                  <span className="text-sm font-medium text-gray-800 dark:text-white">
                    {toPersianLabel(slot.date)} — {formatTime(slot.start_time)}
                  </span>
                  <FaPencil className={themeText[themeColor]} />
                </button>
              ))
            ) : (
              <p className="text-sm text-gray-500">
                زمان آزادی برای ویرایش نیست.
              </p>
            )}
          </div>
        )}

        {selectedSlot && (
          <form onSubmit={handleUpdateSlot} className="space-y-4">
            <p className="text-xs text-gray-400">
              در حال ویرایش زمان #{selectedSlot.id}
            </p>

            <PersianDayPicker
              variant="inline"
              label="تاریخ"
              value={dateValue}
              onChange={setDateValue}
              helperText={
                dateValue
                  ? `شمسی: ${formatJalali(dateValue)} · میلادی: ${dateValue}`
                  : undefined
              }
            />

            <PersianTimePicker
              variant="inline"
              label="ساعت شروع"
              value={startTimeValue}
              onChange={setStartTimeValue}
              clearable={false}
            />

            <div>
              <label className="mb-1.5 block text-sm font-medium">سرویس</label>
              <select
                className="primary-input"
                value={selectedService}
                onChange={(e) => setSelectedService(Number(e.target.value))}
              >
                <option value={0}>انتخاب سرویس</option>
                {services?.map((s: GetServicesItem) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <label className="flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2 dark:bg-emerald-900/20">
              <input
                type="checkbox"
                checked={isAvailable}
                onChange={() => setIsAvailable((v) => !v)}
                className="accent-emerald-600"
              />
              <span className="text-sm">قابل رزرو (آزاد)</span>
            </label>

            <div className="flex gap-2">
              <Button type="submit" disabled={updateSlotMutation.isPending}>
                {updateSlotMutation.isPending
                  ? "در حال ذخیره..."
                  : "ذخیره تغییرات"}
              </Button>
              <button
                type="button"
                className="rounded-xl px-4 text-sm text-gray-500"
                onClick={() => setSelectedSlot(null)}
              >
                بازگشت به لیست
              </button>
            </div>
          </form>
        )}
      </CustomModal>

      {/* ==================== DELETE MODAL ==================== */}
      <CustomModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title="حذف زمان آزاد"
      >
        {freeSlots && freeSlots.length > 0 ? (
          freeSlots.map((slot) => (
            <div
              key={slot.id}
              className="relative mb-3 flex flex-col gap-1 rounded-e-xl border-s-2 border-s-red-500 bg-slate-100 p-3 dark:bg-gray-700"
            >
              <p className="text-sm text-gray-700 dark:text-gray-200">
                {toPersianLabel(slot.date)} — {formatTime(slot.start_time)}
              </p>
              <button
                type="button"
                className="absolute left-3 top-3 text-lg text-red-500"
                onClick={() => handleRemoveSlot(slot.id)}
              >
                <FaTrashCan />
              </button>
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-500">زمان آزادی برای حذف نیست.</p>
        )}
      </CustomModal>

      {/* ==================== HEADER ==================== */}
      <div className="mt-8 flex items-center justify-between">
        <PageTitle title="زمان‌های در دسترس" />
        <Dropdown
          isAddOpen={isAddOpen}
          setIsAddOpen={setIsAddOpen}
          isUpdateOpen={isUpdateOpen}
          setIsUpdateOpen={setIsUpdateOpen}
          isDeleteOpen={isDeleteOpen}
          setIsDeleteOpen={setIsDeleteOpen}
        />
      </div>

      {isError && (
        <p className="text-center text-sm text-rose-500">
          خطا در بارگذاری زمان‌ها
        </p>
      )}

      {/* ==================== SLOT LIST ==================== */}
      <div className="flex flex-col items-center p-2">
        {isPending && (
          <div className="mt-4">
            <Dots />
          </div>
        )}

        <div className="mb-4 flex flex-wrap items-center justify-center gap-2">
          {(
            [
              { key: "all" as const, label: "همه", count: allSlotsCount },
              {
                key: "available" as const,
                label: "آزاد",
                count: availableSlotsCount,
              },
              {
                key: "unavailable" as const,
                label: "رزرو شده",
                count: unavailableSlotsCount,
              },
            ] as const
          ).map(({ key, label, count }) => (
            <button
              key={key}
              type="button"
              onClick={() => setFilteredSlots(key)}
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                filteredSlots === key
                  ? "bg-gray-800 text-white dark:bg-white dark:text-gray-900"
                  : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300"
              }`}
            >
              <span
                className={`-mt-1 flex h-4 w-6 items-center justify-center rounded-full text-[10px] text-white ${
                  key === "available"
                    ? "bg-green-500"
                    : key === "unavailable"
                      ? "bg-red-500"
                      : "bg-gray-500"
                }`}
              >
                {count}
              </span>
              {label}
            </button>
          ))}
        </div>

        {filteredSlotsArray.length > 0 ? (
          <motion.div
            className="grid w-full max-w-2xl grid-cols-1 gap-3 md:grid-cols-2"
            variants={parentVariants}
            initial="hidden"
            animate="visible"
          >
            {filteredSlotsArray.map((slot: SlotsResponse) => (
              <motion.div
                key={slot.id}
                variants={childrenVariants}
                className={`rounded-2xl border-2 p-4 shadow-sm ${
                  slot.is_available
                    ? "border-emerald-300 bg-emerald-50 dark:border-emerald-700 dark:bg-emerald-900/30"
                    : "border-rose-300 bg-rose-50 dark:border-rose-700 dark:bg-rose-900/30"
                }`}
              >
                <p className="text-sm font-semibold text-gray-800 dark:text-white">
                  {toPersianLabel(slot.date)}
                </p>
                <p className="mt-1 text-lg font-bold text-gray-900 dark:text-gray-100">
                  {formatTime(slot.start_time)}
                </p>
                <p className="mt-0.5 text-xs text-gray-400" dir="ltr">
                  {slot.date}
                </p>
                <span
                  className={`mt-2 inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    slot.is_available
                      ? "bg-emerald-500 text-white"
                      : "bg-rose-500 text-white"
                  }`}
                >
                  {slot.is_available ? "آزاد" : "رزرو شده"}
                </span>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          !isPending && (
            <p className="mt-8 text-gray-500">
              {filteredSlots === "all"
                ? "زمانی برای نمایش وجود ندارد."
                : filteredSlots === "available"
                  ? "زمان آزادی یافت نشد."
                  : "زمان رزرو شده‌ای یافت نشد."}
            </p>
          )
        )}
      </div>
    </section>
  );
};

export default AvailableTimes;
