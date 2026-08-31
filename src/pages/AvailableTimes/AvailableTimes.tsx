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
import Button from "../../components/Button/Button";
import DatePicker from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import TimePicker from "react-multi-date-picker/plugins/time_picker";
import DateObject from "react-date-object";
import { useThemeColor } from "../../context/ThemeColor";
import { AxiosError } from "axios";
import { useQueryClient } from "@tanstack/react-query";
import { FaPencil, FaTrashCan } from "react-icons/fa6";
import { useUpdateSlots } from "../../hooks/slots/useUpdateSlots";
import { useRemoveSlots } from "../../hooks/slots/useRemoveSlots";
import Dropdown from "../../components/Dropdown/Dropdown";
import { motion } from "framer-motion";
import {
  formatTime,
  toGregorianISO,
  toPersianLabel,
  todayPersian,
} from "../../utils/date";
import { LuCalendarDays, LuClock } from "react-icons/lu";
import gregorian from "react-date-object/calendars/gregorian";

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

const AvailableTimes: React.FC = () => {
  const [dateValue, setDateValue] = useState<DateObject | null>(todayPersian());
  const [startTimeValue, setStartTimeValue] = useState<DateObject | null>(
    new DateObject({ calendar: persian, locale: persian_fa }),
  );
  const [selectedService, setSelectedService] = useState<number>(0);
  const [selectedSlot, setSelectedSlot] = useState<SlotsResponse | null>(null);

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isAvailable, setIsAvailable] = useState(true); // default FREE
  const [filteredSlots, setFilteredSlots] = useState<
    "all" | "available" | "unavailable"
  >("all");

  const { data: slots, isPending, isError } = useGetSlots();
  const addSlotMutation = useAddSlots();
  const updateSlotMutation = useUpdateSlots();
  const removeSlotMutation = useRemoveSlots();
  const { data: services } = useGetServices();
  const { themeColor } = useThemeColor();
  const queryClient = useQueryClient();

  const handleChangeDate = (val: DateObject | null) => {
    setDateValue(val);
  };

  const handleChangeTime = (date: DateObject | null) => {
    setStartTimeValue(date);
  };

  const parseError = (err: unknown, fallback: string) => {
    const ax = err as AxiosError<Record<string, unknown> | string[]>;
    const data = ax.response?.data;
    if (Array.isArray(data) && data[0]) return String(data[0]);
    if (data && typeof data === "object") {
      if (typeof (data as { detail?: string }).detail === "string") {
        return (data as { detail: string }).detail;
      }
      const first = Object.values(data).find(
        (v) => Array.isArray(v) && v[0],
      ) as string[] | undefined;
      if (first?.[0]) return String(first[0]);
    }
    return fallback;
  };

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

    // CRITICAL: Gregorian for API (Swagger format: date)
    const dateStr = toGregorianISO(dateValue);
    const hour = startTimeValue.hour ?? 0;
    const minute = startTimeValue.minute ?? 0;
    const startTimeStr = `${String(hour).padStart(2, "0")}:${String(
      minute,
    ).padStart(2, "0")}:00`;

    const payload = {
      service_id: selectedService,
      date: dateStr,
      start_time: startTimeStr,
      is_available: isAvailable,
    };

    const toastId = toast.loading("در حال افزودن زمان...");

    addSlotMutation.mutate(payload, {
      onSuccess: () => {
        toast.success("زمان آزاد ثبت شد", { id: toastId });
        queryClient.invalidateQueries({ queryKey: ["slots"] });
        queryClient.invalidateQueries({ queryKey: ["available-times"] });
        setIsAddOpen(false);
        setDateValue(todayPersian());
        setSelectedService(0);
        setIsAvailable(true);
      },
      onError: (err) => {
        toast.error(parseError(err, "خطا در افزودن زمان"), { id: toastId });
        console.error("Failed to add slot", err);
      },
    });
  };

  const openEditSlot = (slot: SlotsResponse) => {
    setSelectedSlot(slot);
    setSelectedService(slot.service || 0);
    setIsAvailable(!!slot.is_available);

    // date from API (Gregorian) → Persian DateObject for picker
    try {
      const [y, m, d] = slot.date.split("-").map(Number);
      if (y && m && d) {
        const g = new DateObject({
          calendar: gregorian,
          year: y,
          month: m,
          day: d,
        });
        setDateValue(g.convert(persian).setLocale(persian_fa));
      }
    } catch {
      setDateValue(todayPersian());
    }

    // time
    try {
      const [hh, mm] = String(slot.start_time).split(":").map(Number);
      const t = new DateObject({ calendar: persian, locale: persian_fa });
      t.hour = hh || 0;
      t.minute = mm || 0;
      setStartTimeValue(t);
    } catch {
      setStartTimeValue(
        new DateObject({ calendar: persian, locale: persian_fa }),
      );
    }

    setIsUpdateOpen(true);
  };

  const handleUpdateSlot = (e: FormEvent) => {
    e.preventDefault();
    if (!selectedSlot) return;

    const dateStr = dateValue ? toGregorianISO(dateValue) : selectedSlot.date;

    const startTimeStr = startTimeValue
      ? `${String(startTimeValue.hour).padStart(2, "0")}:${String(
          startTimeValue.minute,
        ).padStart(2, "0")}:00`
      : selectedSlot.start_time;

    updateSlotMutation.mutate(
      {
        id: selectedSlot.id,
        updateSlot: {
          service_id: selectedService || selectedSlot.service,
          date: dateStr,
          start_time: startTimeStr,
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
          toast.error(parseError(err, "خطا در بروزرسانی زمان"));
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
        toast.error(parseError(err, "خطا در حذف زمان"), { id: slotId });
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

  const persianPreview = dateValue ? dateValue.format("YYYY/MM/DD") : "—";
  const gregorianPreview = dateValue ? toGregorianISO(dateValue) : "—";

  return (
    <section className="space-y-6 pb-10">
      {/* ========== ADD MODAL ========== */}
      <CustomModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="افزودن زمان آزاد"
      >
        <form onSubmit={handleAddSlot} className="space-y-4">
          <p className="rounded-xl bg-emerald-50 px-3 py-2 text-xs leading-5 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200">
            تاریخ را شمسی انتخاب کنید؛ برای سرور به‌صورت میلادی (`YYYY-MM-DD`)
            ذخیره می‌شود.
          </p>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-200">
              تاریخ (شمسی)
            </label>
            <PersianDayPicker
              value={dateValue}
              onChange={handleChangeDate}
              buttonLabel={
                dateValue ? `تاریخ: ${persianPreview}` : "انتخاب تاریخ"
              }
              buttonIcon={
                <LuCalendarDays size={18} className="text-emerald-600" />
              }
              bgColor="bg-white dark:bg-gray-700"
              textColor="gray-700"
              selectedRed={false}
            />
            <p className="mt-1.5 text-[11px] text-gray-400">
              شمسی: <b>{persianPreview}</b>
              {" · "}
              API:{" "}
              <span className="font-mono" dir="ltr">
                {gregorianPreview}
              </span>
            </p>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-200">
              ساعت شروع
            </label>
            <DatePicker
              calendar={persian}
              format="HH:mm"
              locale={persian_fa}
              value={startTimeValue}
              disableDayPicker
              plugins={[<TimePicker hideSeconds key="tp" />]}
              calendarPosition="bottom-right"
              onChange={handleChangeTime}
              render={(_value, openCalendar) => (
                <button
                  type="button"
                  onClick={openCalendar}
                  className="flex w-full items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-base font-medium text-gray-700 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                >
                  <LuClock size={18} className="text-emerald-600" />
                  {startTimeValue
                    ? `${String(startTimeValue.hour).padStart(2, "0")}:${String(
                        startTimeValue.minute,
                      ).padStart(2, "0")}`
                    : "انتخاب ساعت"}
                </button>
              )}
            />
          </div>

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

      {/* ========== UPDATE MODAL ========== */}
      <CustomModal
        isOpen={isUpdateOpen}
        onClose={() => {
          setIsUpdateOpen(false);
          setSelectedSlot(null);
        }}
        title="بروزرسانی زمان"
      >
        {/* List: pick a slot to edit */}
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
                  className={`flex w-full items-center justify-between rounded-xl border border-gray-100 bg-slate-50 p-3 text-right dark:border-gray-600 dark:bg-gray-700`}
                >
                  <span className="text-sm font-medium text-gray-800 dark:text-white">
                    {toPersianLabel(slot.date)} — {formatTime(slot.start_time)}
                  </span>
                  <FaPencil className={`text-${themeColor}-500`} />
                </button>
              ))
            ) : (
              <p className="text-sm text-gray-500">
                زمان آزادی برای ویرایش نیست.
              </p>
            )}
          </div>
        )}

        {/* Form: only after a slot is chosen → uses handleUpdateSlot */}
        {selectedSlot && (
          <form onSubmit={handleUpdateSlot} className="space-y-4">
            <p className="text-xs text-gray-400">
              در حال ویرایش زمان #{selectedSlot.id}
            </p>

            <div>
              <label className="mb-1.5 block text-sm font-medium">
                تاریخ (شمسی)
              </label>
              <PersianDayPicker
                value={dateValue}
                onChange={handleChangeDate}
                buttonLabel={
                  dateValue
                    ? `تاریخ: ${dateValue.format("YYYY/MM/DD")}`
                    : "انتخاب تاریخ"
                }
                buttonIcon={
                  <LuCalendarDays size={18} className="text-emerald-600" />
                }
                bgColor="bg-white dark:bg-gray-700"
                textColor="gray-700"
                selectedRed={false}
              />
              <p className="mt-1 text-[11px] text-gray-400">
                API:{" "}
                <span className="font-mono" dir="ltr">
                  {dateValue ? toGregorianISO(dateValue) : "—"}
                </span>
              </p>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium">
                ساعت شروع
              </label>
              <DatePicker
                calendar={persian}
                format="HH:mm"
                locale={persian_fa}
                value={startTimeValue}
                disableDayPicker
                plugins={[<TimePicker hideSeconds key="tp-edit" />]}
                calendarPosition="bottom-right"
                onChange={handleChangeTime}
                render={(_value, openCalendar) => (
                  <button
                    type="button"
                    onClick={openCalendar}
                    className="flex w-full items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  >
                    <LuClock size={18} className="text-emerald-600" />
                    {startTimeValue
                      ? `${String(startTimeValue.hour).padStart(2, "0")}:${String(
                          startTimeValue.minute,
                        ).padStart(2, "0")}`
                      : "انتخاب ساعت"}
                  </button>
                )}
              />
            </div>

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

      {/* ========== DELETE MODAL ========== */}
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

      <div className="flex flex-col items-center p-2">
        {isPending && (
          <div className="mt-4">
            <Dots />
          </div>
        )}

        <div className="mb-6 flex items-center gap-4">
          {(
            [
              ["all", "همه", allSlotsCount, themeColor],
              ["available", "آزاد", availableSlotsCount, "green"],
              ["unavailable", "رزرو شده", unavailableSlotsCount, "red"],
            ] as const
          ).map(([key, label, count, color]) => (
            <button
              key={key}
              type="button"
              className={`relative border-b-2 p-1 text-xs font-medium ${
                filteredSlots === key
                  ? color === "green"
                    ? "border-green-500 text-green-500"
                    : color === "red"
                      ? "border-red-500 text-red-500"
                      : `border-${themeColor}-500 text-${themeColor}-500`
                  : "border-transparent text-gray-500 dark:text-gray-200"
              }`}
              onClick={() => setFilteredSlots(key)}
            >
              <span
                className={`absolute -top-3 -right-1 flex h-4 w-6 items-center justify-center rounded-full bg-${themeColor}-500 text-[10px] text-white`}
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
                <p className="mt-0.5 text-[11px] text-gray-400" dir="ltr">
                  {slot.date}
                </p>
                <span
                  className={`mt-2 inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
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
