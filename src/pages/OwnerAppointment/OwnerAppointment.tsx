import React from "react";
import { useNavigate, useParams } from "react-router";
import {
  FaUser,
  FaPhoneAlt,
  FaCalendarAlt,
  FaClock,
  FaCut,
  FaUserTie,
  FaArrowRight,
  FaCheck,
  FaTimes,
} from "react-icons/fa";

import PageTitle from "../../components/PageTitle/PageTitle";
import Button from "../../components/Button/Button";
import Dots from "../../components/Dots/Dots";
import {
  useBusinessAppointment,
  useUpdateBusinessAppointmentStatus,
} from "../../hooks/appointments/useBusinessAppointments";
import { useThemeColor } from "../../context/ThemeColor";
import { themeText, themeBgSoft, themeBgSolid } from "../../utils/themeClasses";
import type { AppointmentStatus } from "../../types/appointments";

const statusMeta: Record<
  AppointmentStatus,
  { label: string; className: string }
> = {
  pending: {
    label: "در انتظار تأیید",
    className:
      "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200",
  },
  confirmed: {
    label: "تأیید شده",
    className:
      "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200",
  },
  canceled: {
    label: "لغو شده",
    className: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200",
  },
};

function formatDateFa(isoDate: string): string {
  try {
    const d = new Date(isoDate);
    if (Number.isNaN(d.getTime())) return isoDate;
    return d.toLocaleDateString("fa-IR");
  } catch {
    return isoDate;
  }
}

function formatTime(t: string): string {
  if (!t) return "—";
  // "14:30:00" → "14:30"
  return t.slice(0, 5);
}

const OwnerAppointment: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const appointmentId = Number(id);
  const navigate = useNavigate();
  const { themeColor } = useThemeColor();

  const {
    data: appt,
    isLoading,
    isError,
    refetch,
  } = useBusinessAppointment(
    Number.isFinite(appointmentId) ? appointmentId : undefined,
  );

  const updateMut = useUpdateBusinessAppointmentStatus();

  const setStatus = (status: AppointmentStatus) => {
    if (!appt) return;
    const msg =
      status === "confirmed"
        ? "نوبت تأیید شود؟"
        : status === "canceled"
          ? "نوبت رد/لغو شود؟"
          : "تغییر وضعیت؟";
    if (!window.confirm(msg)) return;
    updateMut.mutate({ id: appt.id, payload: { status } });
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Dots />
      </div>
    );
  }

  if (isError || !appt) {
    return (
      <div className="mx-auto max-w-lg space-y-4 p-4 text-center">
        <p className="rounded-2xl bg-red-50 p-4 text-red-600 dark:bg-red-900/20">
          نوبت یافت نشد یا دسترسی ندارید
        </p>
        <div className="mx-auto flex w-full max-w-xs gap-2">
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate(-1)}
          >
            بازگشت
          </Button>
          <Button type="button" onClick={() => refetch()}>
            تلاش مجدد
          </Button>
        </div>
      </div>
    );
  }

  const st = statusMeta[appt.status] ?? statusMeta.pending;
  const isPending = appt.status === "pending";

  const rows: {
    icon: React.ReactNode;
    label: string;
    value: string;
    dir?: "ltr";
  }[] = [
    {
      icon: <FaUser size={14} />,
      label: "مشتری",
      value: appt.customer_name,
    },
    {
      icon: <FaPhoneAlt size={14} />,
      label: "تلفن",
      value: appt.customer_phone,
      dir: "ltr",
    },
    {
      icon: <FaCut size={14} />,
      label: "خدمت",
      value: appt.service_name,
    },
    {
      icon: <FaUserTie size={14} />,
      label: "آرایشگر",
      value: appt.employee_name,
    },
    {
      icon: <FaCalendarAlt size={14} />,
      label: "تاریخ",
      value: formatDateFa(appt.date),
    },
    {
      icon: <FaClock size={14} />,
      label: "ساعت",
      value: `${formatTime(appt.start_time)} – ${formatTime(appt.end_time)}`,
      dir: "ltr",
    },
  ];

  return (
    <div className="mx-auto max-w-lg space-y-5 pb-28">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex h-10 w-10 items-center justify-center rounded-xl text-gray-500 transition hover:bg-gray-100 dark:hover:bg-gray-800"
          aria-label="بازگشت"
        >
          <FaArrowRight size={16} />
        </button>
        <div>
          <PageTitle title="جزئیات نوبت" />
          <p className="text-xs text-gray-500">مدیریت نوبت مشتری</p>
        </div>
      </div>

      {/* Status banner */}
      <div
        className={`flex items-center justify-between rounded-2xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800`}
      >
        <div>
          <p className="text-xs text-gray-500">وضعیت</p>
          <span
            className={`mt-1 inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${st.className}`}
          >
            {st.label}
          </span>
        </div>
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-2xl ${themeBgSoft[themeColor]} ${themeText[themeColor]}`}
        >
          #{appt.id}
        </div>
      </div>

      {/* Details */}
      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <ul className="divide-y divide-gray-100 dark:divide-gray-700">
          {rows.map((row) => (
            <li key={row.label} className="flex items-center gap-3 px-4 py-3.5">
              <span
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${themeBgSoft[themeColor]} ${themeText[themeColor]}`}
              >
                {row.icon}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-gray-500">{row.label}</p>
                <p
                  className="truncate text-sm font-medium text-gray-900 dark:text-white"
                  dir={row.dir}
                >
                  {row.value || "—"}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Owner actions — NO payment button */}
      {isPending && (
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            disabled={updateMut.isPending}
            onClick={() => setStatus("canceled")}
            className="flex items-center justify-center gap-2 rounded-xl bg-red-600 py-3 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-60"
          >
            <FaTimes size={14} />
            رد نوبت
          </button>
          <button
            type="button"
            disabled={updateMut.isPending}
            onClick={() => setStatus("confirmed")}
            className={`flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold text-white transition disabled:opacity-60 ${themeBgSolid[themeColor]}`}
          >
            <FaCheck size={14} />
            تأیید نوبت
          </button>
        </div>
      )}

      {!isPending && (
        <div className="rounded-2xl border border-dashed border-gray-300 py-6 text-center text-sm text-gray-500 dark:border-gray-600">
          این نوبت دیگر قابل تغییر وضعیت از این صفحه نیست.
        </div>
      )}

      <Button
        type="button"
        variant="secondary"
        onClick={() => navigate("/manage-appointments")}
      >
        بازگشت به لیست نوبت‌ها
      </Button>
    </div>
  );
};

export default OwnerAppointment;
