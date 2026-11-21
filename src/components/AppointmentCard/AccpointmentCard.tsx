import React from "react";
import { useNavigate } from "react-router";
import { FaEye, FaUser } from "react-icons/fa";
import { MdOutlineCancel } from "react-icons/md";
import { motion } from "framer-motion";
import DetailsMenu from "../DetailsMenu/DetailsMenu";
import { useCancelAppointment } from "../../hooks/appointments/useCancelAppointment";

interface AppointmentCardProps {
  appointment: {
    id: number;
    service?: { name?: string; price?: string; duration?: string };
    status: string;
    get_status?: string;
    employee_name?: string;
    employee?: {
      user?: string | { first_name?: string; last_name?: string };
      skill?: string;
    };
  };
}

const statusStyles: Record<
  string,
  { dot: string; badge: string; label: string }
> = {
  confirmed: {
    dot: "bg-green-500",
    badge:
      "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300",
    label: "تأیید شده",
  },
  canceled: {
    dot: "bg-red-500",
    badge: "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300",
    label: "لغو شده",
  },
  completed: {
    dot: "bg-blue-500",
    badge: "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
    label: "انجام شده",
  },
  pending: {
    dot: "bg-amber-500",
    badge:
      "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
    label: "در انتظار",
  },
};

const AppointmentCard: React.FC<AppointmentCardProps> = ({ appointment }) => {
  const navigate = useNavigate();
  const cancelMutation = useCancelAppointment(appointment.id);

  const style = statusStyles[appointment.status] || statusStyles.pending;
  const serviceName = appointment.service?.name || "خدمت";

  const employeeName =
    appointment.employee_name ||
    (typeof appointment.employee?.user === "string"
      ? appointment.employee.user
      : [
          appointment.employee?.user?.first_name,
          appointment.employee?.user?.last_name,
        ]
          .filter(Boolean)
          .join(" ")) ||
    "—";

  // Swagger: POST cancel — فقط pending | confirmed
  const canCancel =
    appointment.status === "pending" || appointment.status === "confirmed";

  const handleCancel = () => {
    if (!canCancel || cancelMutation.isPending) return;
    if (!window.confirm("این نوبت لغو شود؟")) return;
    cancelMutation.mutate();
  };

  const menuItems = [
    {
      label: "مشاهده",
      onClick: () => navigate(`/view-appointment/${appointment.id}`),
      icon: <FaEye color="gray" />,
    },
    ...(canCancel
      ? [
          {
            label: cancelMutation.isPending ? "در حال لغو..." : "لغو نوبت",
            onClick: handleCancel,
            icon: <MdOutlineCancel color="gray" />,
          },
        ]
      : []),
  ];

  return (
    <motion.div
      className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition hover:shadow-md dark:border-gray-600 dark:bg-gray-800"
      variants={{
        hidden: { opacity: 0, y: 16 },
        visible: { opacity: 1, y: 0 },
      }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate text-base font-semibold text-gray-900 dark:text-white">
              {serviceName}
            </h3>
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${style.badge}`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
              {appointment.get_status || style.label}
            </span>
          </div>

          <p className="mt-2 flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
            <FaUser className="shrink-0 text-xs" />
            <span className="truncate">{employeeName}</span>
            {appointment.employee?.skill && (
              <span className="text-gray-400">
                · {appointment.employee.skill}
              </span>
            )}
          </p>

          {(appointment.service?.price || appointment.service?.duration) && (
            <div className="mt-3 flex flex-wrap gap-3 text-xs text-gray-500 dark:text-gray-400">
              {appointment.service?.duration && (
                <span>{appointment.service.duration} دقیقه</span>
              )}
              {appointment.service?.price && (
                <span className="font-medium text-gray-700 dark:text-gray-200">
                  {new Intl.NumberFormat("fa-IR").format(
                    Number(appointment.service.price),
                  )}{" "}
                  تومان
                </span>
              )}
            </div>
          )}
        </div>

        <DetailsMenu menuItems={menuItems} />
      </div>

      <button
        type="button"
        onClick={() => navigate(`/view-appointment/${appointment.id}`)}
        className="mt-4 w-full rounded-xl border border-gray-200 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
      >
        جزئیات رزرو
      </button>
    </motion.div>
  );
};

export default AppointmentCard;
