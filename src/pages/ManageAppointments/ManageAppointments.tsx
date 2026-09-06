import React, { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import {
  LuCalendarDays,
  LuCheck,
  LuPhone,
  LuUser,
  LuX,
  LuClock3,
  LuScissors,
} from "react-icons/lu";
import { PiFilesDuotone } from "react-icons/pi";
import PageTitle from "../../components/PageTitle/PageTitle";
import Dots from "../../components/Dots/Dots";
import Button from "../../components/Button/Button";
import { useThemeColor } from "../../context/ThemeColor";
import { useGetBusinessAppointments } from "../../hooks/appointments/useGetBusinessAppointments";
import { useUpdateBusinessAppointment } from "../../hooks/appointments/useUpdateBusinessAppointment";
import { BusinessAppointment } from "../../services/appointments/getBusinessAppointments";
import { toPersianLabel, formatTime } from "../../utils/date";
import { themeBgSolid, themeText } from "../../utils/themeClasses";

type FilterKey = "today" | "pending" | "confirmed" | "canceled" | "all";

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "today", label: "امروز" },
  { key: "pending", label: "در انتظار" },
  { key: "confirmed", label: "تأیید شده" },
  { key: "canceled", label: "رد / لغو" },
  { key: "all", label: "تاریخچه" },
];

const todayISO = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

const statusMeta = (status?: string) => {
  switch (status) {
    case "pending":
      return {
        label: "در انتظار تأیید",
        chip: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300",
        bar: "border-s-amber-500",
      };
    case "confirmed":
      return {
        label: "تأیید شده",
        chip: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300",
        bar: "border-s-emerald-500",
      };
    case "canceled":
      return {
        label: "لغو / رد شده",
        chip: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:text-rose-300",
        bar: "border-s-rose-500",
      };
    default:
      return {
        label: status || "نامشخص",
        chip: "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300",
        bar: "border-s-gray-400",
      };
  }
};

function parseApiError(error: unknown, fallback: string): string {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ax = error as { response?: { data?: any } };
  const data = ax.response?.data;
  if (typeof data === "string" && data.trim()) return data;
  if (data && typeof data === "object") {
    if (typeof data.detail === "string") return data.detail;
    const first = Object.values(data).find((v) => Array.isArray(v) && v[0]) as
      | string[]
      | undefined;
    if (first?.[0]) return String(first[0]);
  }
  return fallback;
}

const ManageAppointments: React.FC = () => {
  const { themeColor } = useThemeColor();
  const [filter, setFilter] = useState<FilterKey>("pending");
  const [busyId, setBusyId] = useState<number | null>(null);

  const {
    data: appointments = [],
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useGetBusinessAppointments();

  const updateMutation = useUpdateBusinessAppointment();

  const counts = useMemo(() => {
    const t = todayISO();
    return {
      today: appointments.filter((a) => (a.date || "").startsWith(t)).length,
      pending: appointments.filter((a) => a.status === "pending").length,
      confirmed: appointments.filter((a) => a.status === "confirmed").length,
      canceled: appointments.filter((a) => a.status === "canceled").length,
      all: appointments.length,
    };
  }, [appointments]);

  const filtered = useMemo(() => {
    const t = todayISO();
    if (filter === "today")
      return appointments.filter((a) => (a.date || "").startsWith(t));
    if (filter === "all") return appointments;
    return appointments.filter((a) => a.status === filter);
  }, [appointments, filter]);

  const sorted = useMemo(
    () =>
      [...filtered].sort((a, b) => {
        if (a.status === "pending" && b.status !== "pending") return -1;
        if (b.status === "pending" && a.status !== "pending") return 1;
        return `${b.date} ${b.start_time}`.localeCompare(
          `${a.date} ${a.start_time}`,
        );
      }),
    [filtered],
  );

  const handleStatus = async (
    item: BusinessAppointment,
    status: "confirmed" | "canceled",
  ) => {
    if (item.status !== "pending") {
      toast.error("فقط نوبت‌های در انتظار قابل تغییرند");
      return;
    }
    const toastId = toast.loading(
      status === "confirmed" ? "در حال تأیید..." : "در حال رد...",
    );
    setBusyId(item.id);
    try {
      await updateMutation.mutateAsync({ id: item.id, payload: { status } });
      toast.success(status === "confirmed" ? "نوبت تأیید شد" : "نوبت رد شد", {
        id: toastId,
      });
    } catch (err) {
      toast.error(
        parseApiError(
          err,
          status === "confirmed" ? "تأیید ناموفق" : "رد ناموفق",
        ),
        { id: toastId },
      );
    } finally {
      setBusyId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Dots />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="mx-auto max-w-lg space-y-4 py-12 text-center">
        <p className="text-rose-600">خطا در دریافت نوبت‌ها</p>
        <p className="text-xs text-gray-500">{parseApiError(error, "")}</p>
        <Button type="button" onClick={() => refetch()}>
          تلاش مجدد
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 pb-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <PageTitle title="مدیریت نوبت‌ها" />
        <button
          type="button"
          onClick={() => refetch()}
          disabled={isFetching}
          className="rounded-xl border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-600 dark:border-gray-600 dark:text-gray-300"
        >
          {isFetching ? "..." : "بروزرسانی"}
        </button>
      </div>

      <p className="text-xs leading-6 text-gray-500 dark:text-gray-400">
        نوبت‌های جدید با وضعیت <b>در انتظار</b> ثبت می‌شوند. بعد از تأیید یا رد
        شما، وضعیت برای مشتری نمایش داده می‌شود.
      </p>

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => {
          const active = filter === f.key;
          return (
            <button
              key={f.key}
              type="button"
              onClick={() => setFilter(f.key)}
              className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition ${
                active
                  ? `${themeBgSolid[themeColor]} text-white shadow`
                  : "border border-gray-200 bg-white text-gray-600 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300"
              }`}
            >
              {f.label}
              <span
                className={`mr-1 text-xs ${active ? "text-white/80" : "text-gray-400"}`}
              >
                ({counts[f.key]})
              </span>
            </button>
          );
        })}
      </div>

      {sorted.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-gray-200 bg-white py-16 dark:border-gray-600 dark:bg-gray-800">
          <PiFilesDuotone size={52} className="text-gray-400" />
          <p className="font-semibold text-gray-800 dark:text-gray-200">
            موردی در این فیلتر نیست
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {sorted.map((item) => {
            const meta = statusMeta(item.status);
            const canAct = item.status === "pending" && busyId !== item.id;
            return (
              <motion.article
                key={item.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`rounded-2xl border border-gray-100 border-s-4 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800 ${meta.bar}`}
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-bold text-gray-800 dark:text-white">
                        {item.customer_name || "مشتری"}
                      </h3>
                      <span
                        className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${meta.chip}`}
                      >
                        {meta.label}
                      </span>
                    </div>
                    <p className="mt-1 flex items-center gap-1.5 text-xs text-gray-500">
                      <LuPhone size={13} />
                      <span dir="ltr">{item.customer_phone || "—"}</span>
                    </p>
                  </div>
                  <span className="text-[11px] text-gray-400">#{item.id}</span>
                </div>

                <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                    <LuScissors className={themeText[themeColor]} size={16} />
                    {item.service_name || "سرویس"}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                    <LuUser className={themeText[themeColor]} size={16} />
                    {item.employee_name || "آرایشگر"}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                    <LuCalendarDays
                      className={themeText[themeColor]}
                      size={16}
                    />
                    {toPersianLabel(item.date) || item.date || "—"}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                    <LuClock3 className={themeText[themeColor]} size={16} />
                    {formatTime(item.start_time)}
                    {item.end_time ? ` – ${formatTime(item.end_time)}` : ""}
                  </div>
                </div>

                {item.status === "pending" && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      type="button"
                      disabled={!canAct}
                      onClick={() => handleStatus(item, "confirmed")}
                      className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50 sm:flex-none"
                    >
                      <LuCheck size={16} /> تأیید
                    </button>
                    <button
                      type="button"
                      disabled={!canAct}
                      onClick={() => handleStatus(item, "canceled")}
                      className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-50 sm:flex-none"
                    >
                      <LuX size={16} /> رد
                    </button>
                  </div>
                )}
              </motion.article>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ManageAppointments;
