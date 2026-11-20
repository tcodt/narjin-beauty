import React, { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { BiSolidCalendarCheck, BiSolidCalendarX } from "react-icons/bi";
import { FaRegTrashAlt, FaPlus } from "react-icons/fa";
import { FiCalendar, FiAlertCircle } from "react-icons/fi";

import Loading from "../../components/Loading/Loading";
import PageTitle from "../../components/PageTitle/PageTitle";
import Button from "../../components/Button/Button";
import CustomModal from "../../components/CustomModal/CustomModal";
import PersianDayPicker from "../../components/PersianDayPicker/PersianDayPicker";
import PersianTimePicker from "../../components/PersianTimePicker/PersianTimePicker";
import { useThemeColor } from "../../context/ThemeColor";
import { useAcl } from "../../context/AclContext";
import { parseApiError } from "../../utils/parseApiError";
import { isoToJalali, toPersianDigits } from "../../utils/jalali";

import {
  useWeeklySchedule,
  useUpsertWeekly,
  useDeleteWeeklyDay,
} from "../../hooks/working-time/useWeeklySchedule";
import {
  useHolidays,
  useCreateHoliday,
  useDeleteHoliday,
} from "../../hooks/working-time/useHolidays";
import { WEEKDAY_MAP, type WeeklyUpsertItem } from "../../types/working-time";

type Tab = "weekly" | "holidays";

const parentVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.04 },
  },
};

const childrenVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
};

const formatJalali = (iso: string) => {
  const j = isoToJalali(iso);
  if (!j) return iso;
  return `${toPersianDigits(j.jy)}/${toPersianDigits(
    String(j.jm).padStart(2, "0"),
  )}/${toPersianDigits(String(j.jd).padStart(2, "0"))}`;
};

const WorkingTime: React.FC = () => {
  const { themeColor } = useThemeColor();
  const { hasPermission } = useAcl();

  const canManage =
    hasPermission("working_hours_edit") ||
    hasPermission("working_hours_create") ||
    hasPermission("working_hours_delete");

  const [activeTab, setActiveTab] = useState<Tab>("weekly");

  // Weekly
  const { data: weekly = [], isPending: weeklyLoading } = useWeeklySchedule();
  const upsertMutation = useUpsertWeekly();
  const deleteWeeklyMutation = useDeleteWeeklyDay();

  // Holidays
  const { data: holidays = [], isPending: holidaysLoading } = useHolidays();
  const createHolidayMutation = useCreateHoliday();
  const deleteHolidayMutation = useDeleteHoliday();

  // Edit modal state
  const [editDay, setEditDay] = useState<number | null>(null); // weekday
  const [isOpen, setIsOpen] = useState(true);
  const [opening, setOpening] = useState("09:00");
  const [closing, setClosing] = useState("18:00");

  // Holiday modal
  const [isHolidayModalOpen, setIsHolidayModalOpen] = useState(false);
  const [holidayDate, setHolidayDate] = useState("");
  const [holidayTitle, setHolidayTitle] = useState("");

  // UX derived state
  const weeklyMap = useMemo(() => {
    const map = new Map<number, (typeof weekly)[0]>();
    weekly.forEach((item) => map.set(item.weekday, item));
    return map;
  }, [weekly]);

  const sortedHolidays = useMemo(
    () => [...holidays].sort((a, b) => a.date.localeCompare(b.date)),
    [holidays],
  );

  const timeRangeInvalid = isOpen && opening >= closing;

  const openEditModal = (weekday: number) => {
    const existing = weeklyMap.get(weekday);
    setEditDay(weekday);
    setIsOpen(existing?.is_open ?? true);
    setOpening(existing?.opening_time?.slice(0, 5) ?? "09:00");
    setClosing(existing?.closing_time?.slice(0, 5) ?? "18:00");
  };

  const handleSaveWeekly = () => {
    if (editDay === null) return;
    if (timeRangeInvalid) {
      toast.error("ساعت بسته شدن باید بعد از ساعت باز شدن باشد");
      return;
    }

    const payload: WeeklyUpsertItem = {
      weekday: editDay,
      is_open: isOpen,
      opening_time: isOpen ? opening : null,
      closing_time: isOpen ? closing : null,
    };

    const toastId = toast.loading("در حال ذخیره...");
    upsertMutation.mutate(payload, {
      onSuccess: () => {
        toast.success("برنامه هفتگی ذخیره شد", { id: toastId });
        setEditDay(null);
      },
      onError: (err) => {
        toast.error(parseApiError(err), { id: toastId });
      },
    });
  };

  const handleDeleteWeekly = (id: number) => {
    const toastId = toast.loading("در حال حذف...");
    deleteWeeklyMutation.mutate(id, {
      onSuccess: () => toast.success("حذف شد", { id: toastId }),
      onError: (err) => toast.error(parseApiError(err), { id: toastId }),
    });
  };

  const handleCreateHoliday = () => {
    if (!holidayDate) {
      toast.error("تاریخ الزامی است");
      return;
    }

    const toastId = toast.loading("در حال ثبت تعطیلی...");
    createHolidayMutation.mutate(
      { date: holidayDate, title: holidayTitle.trim() || undefined },
      {
        onSuccess: () => {
          toast.success("تعطیلی ثبت شد", { id: toastId });
          setIsHolidayModalOpen(false);
          setHolidayDate("");
          setHolidayTitle("");
        },
        onError: (err) => toast.error(parseApiError(err), { id: toastId }),
      },
    );
  };

  const handleDeleteHoliday = (id: number) => {
    const toastId = toast.loading("در حال حذف...");
    deleteHolidayMutation.mutate(id, {
      onSuccess: () => toast.success("حذف شد", { id: toastId }),
      onError: (err) => toast.error(parseApiError(err), { id: toastId }),
    });
  };

  if (weeklyLoading || holidaysLoading) return <Loading />;

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <PageTitle title="ساعات کاری و تعطیلات" />
      </div>

      {/* Tabs */}
      <div
        role="tablist"
        aria-label="بخش‌های ساعات کاری"
        className="flex gap-2 p-1 bg-slate-100 dark:bg-gray-800 rounded-xl"
      >
        <button
          role="tab"
          aria-selected={activeTab === "weekly"}
          aria-controls="panel-weekly"
          onClick={() => setActiveTab("weekly")}
          className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            activeTab === "weekly"
              ? `bg-white dark:bg-gray-700 text-${themeColor}-300 shadow`
              : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
          }`}
        >
          برنامه هفتگی
        </button>
        <button
          role="tab"
          aria-selected={activeTab === "holidays"}
          aria-controls="panel-holidays"
          onClick={() => setActiveTab("holidays")}
          className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            activeTab === "holidays"
              ? `bg-white dark:bg-gray-700 text-${themeColor}-300 shadow`
              : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
          }`}
        >
          تعطیلات
        </button>
      </div>

      {/* ==================== WEEKLY TAB ==================== */}
      {activeTab === "weekly" && (
        <motion.div
          id="panel-weekly"
          role="tabpanel"
          variants={parentVariants}
          initial="hidden"
          animate="visible"
          className="space-y-3"
        >
          {WEEKDAY_MAP.map((day) => {
            const item = weeklyMap.get(day.value);
            const isConfigured = !!item;

            return (
              <motion.div
                key={day.value}
                variants={childrenVariants}
                className={`p-4 rounded-xl bg-white dark:bg-gray-700 border-s-4 border-${themeColor}-500 shadow-sm`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h3
                      className={`font-semibold text-${themeColor}-600 dark:text-${themeColor}-400`}
                    >
                      {day.label}
                    </h3>

                    {isConfigured ? (
                      item!.is_open ? (
                        <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                          <span className="inline-flex items-center gap-1.5 rounded-md bg-green-50 dark:bg-green-900/20 px-2 py-1">
                            <BiSolidCalendarCheck className="text-green-500" />
                            باز:{" "}
                            {toPersianDigits(
                              item!.opening_time?.slice(0, 5) ?? "",
                            )}
                          </span>
                          <span className="inline-flex items-center gap-1.5 rounded-md bg-red-50 dark:bg-red-900/20 px-2 py-1">
                            <BiSolidCalendarX className="text-red-500" />
                            بسته:{" "}
                            {toPersianDigits(
                              item!.closing_time?.slice(0, 5) ?? "",
                            )}
                          </span>
                        </div>
                      ) : (
                        <p className="mt-2 text-sm text-red-500 dark:text-red-400 font-medium">
                          تعطیل
                        </p>
                      )
                    ) : (
                      <p className="mt-2 text-sm text-gray-400 dark:text-gray-500">
                        تنظیم نشده
                      </p>
                    )}
                  </div>

                  {canManage && (
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => openEditModal(day.value)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium bg-${themeColor}-50 text-${themeColor}-600 hover:bg-${themeColor}-100 dark:bg-${themeColor}-900/30 dark:text-${themeColor}-400 transition-colors`}
                      >
                        {isConfigured ? "ویرایش" : "تنظیم"}
                      </button>

                      {isConfigured && (
                        <button
                          onClick={() => handleDeleteWeekly(item!.id)}
                          aria-label={`حذف تنظیم ${day.label}`}
                          className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        >
                          <FaRegTrashAlt size={14} />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* ==================== HOLIDAYS TAB ==================== */}
      {activeTab === "holidays" && (
        <div id="panel-holidays" role="tabpanel" className="space-y-4">
          {canManage && (
            <Button
              onClick={() => setIsHolidayModalOpen(true)}
              className="w-full flex items-center justify-center gap-2"
            >
              <FaPlus size={14} />
              افزودن روز تعطیل
            </Button>
          )}

          {sortedHolidays.length === 0 ? (
            <div className="text-center py-12">
              <FiCalendar
                className="mx-auto text-gray-300 dark:text-gray-600 mb-3"
                size={40}
              />
              <p className="text-gray-500 dark:text-gray-400">
                هیچ تعطیلی ثبت نشده است
              </p>
            </div>
          ) : (
            <motion.div
              variants={parentVariants}
              initial="hidden"
              animate="visible"
              className="space-y-3"
            >
              <AnimatePresence initial={false}>
                {sortedHolidays.map((h) => (
                  <motion.div
                    key={h.id}
                    variants={childrenVariants}
                    exit={{ opacity: 0, x: 20 }}
                    className="flex items-center justify-between p-4 rounded-xl bg-white dark:bg-gray-700 border-s-4 border-red-500 shadow-sm"
                  >
                    <div className="min-w-0">
                      <p className="font-medium text-gray-800 dark:text-white">
                        {formatJalali(h.date)}
                      </p>
                      {h.title && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                          {h.title}
                        </p>
                      )}
                    </div>

                    {canManage && (
                      <button
                        onClick={() => handleDeleteHoliday(h.id)}
                        aria-label={`حذف تعطیلی ${formatJalali(h.date)}`}
                        className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors shrink-0"
                      >
                        <FaRegTrashAlt size={14} />
                      </button>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      )}

      {/* ==================== Edit Weekly Modal ==================== */}
      <CustomModal
        isOpen={editDay !== null}
        onClose={() => setEditDay(null)}
        title={`تنظیم ${WEEKDAY_MAP.find((d) => d.value === editDay)?.label ?? ""}`}
      >
        <div className="space-y-6">
          {/* is_open toggle */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
              وضعیت روز
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={isOpen}
              aria-label="باز یا بسته بودن روز"
              onClick={() => setIsOpen((v) => !v)}
              className={`relative w-14 h-8 rounded-full transition-colors ${
                isOpen ? `bg-${themeColor}-500` : "bg-gray-300 dark:bg-gray-600"
              }`}
            >
              <span
                className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow transition-transform ${
                  isOpen ? "translate-x-6" : ""
                }`}
              />
            </button>
          </div>

          <AnimatePresence initial={false}>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-visible" // 👈 was overflow-hidden, which clipped the popups
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <PersianTimePicker
                    variant="inline"
                    label="ساعت باز شدن"
                    value={opening}
                    onChange={(t) => setOpening(t)}
                    clearable={false}
                  />
                  <PersianTimePicker
                    variant="inline"
                    label="ساعت بسته شدن"
                    value={closing}
                    onChange={(t) => setClosing(t)}
                    clearable={false}
                  />
                </div>

                {timeRangeInvalid && (
                  <p className="mt-2 flex items-center gap-1.5 text-xs text-red-500 dark:text-red-400">
                    <FiAlertCircle size={12} />
                    ساعت بسته شدن باید بعد از ساعت باز شدن باشد
                  </p>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex gap-3 pt-2">
            <Button
              onClick={handleSaveWeekly}
              variant="primary"
              disabled={upsertMutation.isPending || timeRangeInvalid}
              className="flex-1"
            >
              {upsertMutation.isPending ? "در حال ذخیره..." : "ذخیره"}
            </Button>
            <button
              onClick={() => setEditDay(null)}
              className="px-5 py-2.5 rounded-xl text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              انصراف
            </button>
          </div>
        </div>
      </CustomModal>

      {/* ==================== Add Holiday Modal ==================== */}
      <CustomModal
        isOpen={isHolidayModalOpen}
        onClose={() => setIsHolidayModalOpen(false)}
        title="افزودن روز تعطیل"
      >
        <div className="space-y-5">
          <PersianDayPicker
            variant="inline"
            label="تاریخ"
            value={holidayDate}
            onChange={setHolidayDate}
            helperText="تاریخ شمسی نمایش داده می‌شود و میلادی ذخیره می‌گردد."
          />

          <div>
            <label
              htmlFor="holiday-title"
              className="text-sm text-gray-600 dark:text-gray-300 mb-1.5 block"
            >
              عنوان (اختیاری)
            </label>
            <input
              id="holiday-title"
              type="text"
              value={holidayTitle}
              onChange={(e) => setHolidayTitle(e.target.value)}
              placeholder="مثلاً: تعطیلات نوروز"
              className="w-full rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2.5 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-500 focus:ring-offset-1 dark:focus:ring-offset-gray-800"
            />
          </div>

          <div className="flex gap-3 pt-1">
            <Button
              onClick={handleCreateHoliday}
              disabled={createHolidayMutation.isPending || !holidayDate}
              className="flex-1"
            >
              {createHolidayMutation.isPending ? "در حال ثبت..." : "ثبت تعطیلی"}
            </Button>
            <button
              onClick={() => setIsHolidayModalOpen(false)}
              className="px-5 py-2.5 rounded-xl text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              انصراف
            </button>
          </div>
        </div>
      </CustomModal>
    </div>
  );
};

export default WorkingTime;
