import React, { useMemo, useState } from "react";
import Loading from "../../components/Loading/Loading";
import { useNavigate } from "react-router";
import { useGetAppointments } from "../../hooks/appointments/useGetAppointments";
import Button from "../../components/Button/Button";
import PageTitle from "../../components/PageTitle/PageTitle";
import { PiFilesDuotone } from "react-icons/pi";
import { motion } from "framer-motion";
import AppointmentCard from "../../components/AppointmentCard/AccpointmentCard";
import { AppointmentStatus } from "../../types/appointments";
import { parseApiError } from "../../utils/parseApiError";

const parentVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.05 },
  },
};

type FilterKey = "all" | AppointmentStatus;

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "همه" },
  { key: AppointmentStatus.Pending, label: "در انتظار" },
  { key: AppointmentStatus.Confirmed, label: "تأیید شده" },
  { key: AppointmentStatus.Canceled, label: "لغو شده" },
];

const AppointmentsList: React.FC = () => {
  const {
    data: appointments,
    isPending,
    isError,
    error,
    refetch,
  } = useGetAppointments();

  const [filter, setFilter] = useState<FilterKey>("all");
  const navigate = useNavigate();

  const filtered = useMemo(() => {
    if (!appointments) return [];
    if (filter === "all") return appointments;
    return appointments.filter((a) => a.status === filter);
  }, [appointments, filter]);

  const counts = useMemo(() => {
    const base: Record<string, number> = { all: appointments?.length ?? 0 };
    Object.values(AppointmentStatus).forEach((s) => {
      base[s] = appointments?.filter((a) => a.status === s).length ?? 0;
    });
    return base;
  }, [appointments]);

  if (isError) {
    return (
      <div className="mx-auto max-w-lg space-y-4 py-16 text-center">
        <p className="text-rose-600">خطا در دریافت رزروها</p>
        <p className="text-xs text-gray-500">{parseApiError(error)}</p>
        <Button type="button" onClick={() => refetch()}>
          تلاش مجدد
        </Button>
      </div>
    );
  }

  if (isPending) return <Loading />;

  return (
    <div className="space-y-6 pb-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <PageTitle title="رزروهای من" />
        <Button
          type="button"
          variant="primary"
          onClick={() => navigate("/reserve")}
        >
          رزرو جدید
        </Button>
      </div>

      <div className="flex flex-wrap gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] scrollbar-none [&::-webkit-scrollbar]:hidden">
        {FILTERS.map((f) => {
          const active = filter === f.key;
          return (
            <button
              key={f.key}
              type="button"
              onClick={() => setFilter(f.key)}
              className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition ${
                active
                  ? "bg-primary-green-600 text-white shadow"
                  : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300"
              }`}
            >
              {f.label}
              <span
                className={`mr-1.5 text-xs ${
                  active ? "text-white/80" : "text-gray-400"
                }`}
              >
                ({counts[f.key] ?? 0})
              </span>
            </button>
          );
        })}
      </div>

      {filtered.length > 0 ? (
        <motion.div
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
          variants={parentVariants}
          initial="hidden"
          animate="visible"
        >
          {filtered.map((appointment) => (
            <AppointmentCard key={appointment.id} appointment={appointment} />
          ))}
        </motion.div>
      ) : (
        <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-gray-200 bg-white px-4 py-16 dark:border-gray-600 dark:bg-gray-800">
          <PiFilesDuotone size={56} className="text-gray-400" />
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
            {filter === "all"
              ? "هنوز رزروی ثبت نکرده‌اید"
              : "رزروی با این وضعیت نیست"}
          </h2>
          <p className="max-w-xs text-center text-sm text-gray-500 dark:text-gray-400">
            از صفحه رزرو، خدمت و زمان مورد نظر خود را انتخاب کنید.
          </p>
          <Button variant="primary" onClick={() => navigate("/reserve")}>
            رزرو نوبت
          </Button>
        </div>
      )}
    </div>
  );
};

export default AppointmentsList;
