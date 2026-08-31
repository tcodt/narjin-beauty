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

type FilterKey = "all" | "pending" | "confirmed" | "canceled";

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "همه" },
  { key: "pending", label: "در انتظار" },
  { key: "confirmed", label: "تأیید شده" },
  { key: "canceled", label: "رد / لغو" },
];

const statusMeta = (status?: string) => {
  switch (status) {
    case "pending":
      return {
        label: "در انتظار تأیید",
        chip: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800",
        bar: "border-s-amber-500",
      };
    case "confirmed":
      return {
        label: "تأیید شده",
        chip: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800",
        bar: "border-s-emerald-500",
      };
    case "canceled":
      return {
        label: "لغو شده",
        chip: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:text-rose-300 dark:border-rose-800",
        bar: "border-s-rose-500",
      };
    default:
      return {
        label: status || "نامشخص",
        chip: "bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-700 dark:text-gray-300",
        bar: "border-s-gray-400",
      };
  }
};

function parseApiError(error: unknown, fallback: string): string {
  const ax = error as {
    response?: { data?: Record<string, unknown> | string };
  };
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
    const base: Record<FilterKey, number> = {
      all: appointments.length,
      pending: 0,
      confirmed: 0,
      canceled: 0,
    };
    appointments.forEach((a) => {
      if (a.status === "pending") base.pending += 1;
      else if (a.status === "confirmed") base.confirmed += 1;
      else if (a.status === "canceled") base.canceled += 1;
    });
    return base;
  }, [appointments]);

  const filtered = useMemo(() => {
    if (filter === "all") return appointments;
    return appointments.filter((a) => a.status === filter);
  }, [appointments, filter]);

  // pending first, then newest date/time
  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      if (a.status === "pending" && b.status !== "pending") return -1;
      if (b.status === "pending" && a.status !== "pending") return 1;
      const da = `${a.date ?? ""} ${a.start_time ?? ""}`;
      const db = `${b.date ?? ""} ${b.start_time ?? ""}`;
      return db.localeCompare(da);
    });
  }, [filtered]);

  const handleStatus = async (
    item: BusinessAppointment,
    status: "confirmed" | "canceled",
  ) => {
    if (item.status !== "pending") {
      toast.error("فقط نوبت‌های در انتظار قابل تغییر هستند");
      return;
    }

    const toastId = toast.loading(
      status === "confirmed" ? "در حال تأیید..." : "در حال رد...",
    );
    setBusyId(item.id);

    try {
      await updateMutation.mutateAsync({
        id: item.id,
        payload: { status },
      });
      toast.success(status === "confirmed" ? "نوبت تأیید شد" : "نوبت رد شد", {
        id: toastId,
      });
    } catch (err) {
      toast.error(
        parseApiError(
          err,
          status === "confirmed" ? "تأیید ناموفق بود" : "رد نوبت ناموفق بود",
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
        <p className="text-rose-600">خطا در دریافت نوبت‌های سالن</p>
        <p className="text-xs text-gray-500">
          {parseApiError(error, "خطای سرور")}
        </p>
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
          className={`rounded-xl border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-600 transition hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800`}
        >
          {isFetching ? "در حال بروزرسانی..." : "بروزرسانی"}
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        {(
          [
            { key: "pending", label: "در انتظار", color: "amber" },
            { key: "confirmed", label: "تأیید شده", color: "emerald" },
            { key: "canceled", label: "رد شده", color: "rose" },
          ] as const
        ).map((s) => (
          <button
            key={s.key}
            type="button"
            onClick={() => setFilter(s.key)}
            className={`rounded-2xl border p-3 text-center transition ${
              filter === s.key
                ? `border-${s.color}-400 bg-${s.color}-50 ring-2 ring-${s.color}-200 dark:bg-${s.color}-900/20`
                : "border-gray-100 bg-white dark:border-gray-700 dark:bg-gray-800"
            }`}
          >
            <p className={`text-2xl font-bold text-${s.color}-600`}>
              {counts[s.key]}
            </p>
            <p className="mt-0.5 text-[11px] text-gray-500">{s.label}</p>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => {
          const active = filter === f.key;
          return (
            <button
              key={f.key}
              type="button"
              onClick={() => setFilter(f.key)}
              className={`whitespace-nowrap rounded-full px-3.5 py-1.5 text-sm font-medium transition ${
                active
                  ? `bg-${themeColor}-600 text-white shadow`
                  : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300"
              }`}
            >
              {f.label}
              <span
                className={`mr-1 text-xs ${
                  active ? "text-white/80" : "text-gray-400"
                }`}
              >
                ({counts[f.key]})
              </span>
            </button>
          );
        })}
      </div>

      {sorted.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-gray-200 bg-white px-4 py-16 dark:border-gray-600 dark:bg-gray-800">
          <PiFilesDuotone size={52} className="text-gray-400" />
          <p className="text-base font-semibold text-gray-800 dark:text-gray-200">
            نوبتی در این وضعیت نیست
          </p>
          <p className="text-sm text-gray-500">
            وقتی مشتری رزرو کند، اینجا نمایش داده می‌شود.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {sorted.map((item) => {
            const meta = statusMeta(item.status);
            const isBusy = busyId === item.id;
            const canAct = item.status === "pending" && !isBusy;

            return (
              <motion.article
                key={item.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`rounded-2xl border border-gray-100 border-s-4 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800 ${meta.bar}`}
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="truncate text-base font-bold text-gray-800 dark:text-white">
                        {item.customer_name || "مشتری"}
                      </h3>
                      <span
                        className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${meta.chip}`}
                      >
                        {meta.label}
                      </span>
                    </div>
                    <p className="flex items-center gap-1.5 text-xs text-gray-500">
                      <LuPhone size={13} />
                      <span dir="ltr">{item.customer_phone || "—"}</span>
                    </p>
                  </div>
                  <span className="text-[11px] text-gray-400">#{item.id}</span>
                </div>

                <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                    <LuScissors
                      className={`text-${themeColor}-500`}
                      size={16}
                    />
                    <span className="truncate">
                      {item.service_name || "سرویس"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                    <LuUser className={`text-${themeColor}-500`} size={16} />
                    <span className="truncate">
                      {item.employee_name || "آرایشگر"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                    <LuCalendarDays
                      className={`text-${themeColor}-500`}
                      size={16}
                    />
                    <span>{toPersianLabel(item.date) || item.date || "—"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                    <LuClock3 className={`text-${themeColor}-500`} size={16} />
                    <span>
                      {formatTime(item.start_time)}
                      {item.end_time ? ` – ${formatTime(item.end_time)}` : ""}
                    </span>
                  </div>
                </div>

                {item.status === "pending" && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      type="button"
                      disabled={!canAct}
                      onClick={() => handleStatus(item, "confirmed")}
                      className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50 sm:flex-none"
                    >
                      <LuCheck size={16} />
                      تأیید
                    </button>
                    <button
                      type="button"
                      disabled={!canAct}
                      onClick={() => handleStatus(item, "canceled")}
                      className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:opacity-50 sm:flex-none"
                    >
                      <LuX size={16} />
                      رد
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
