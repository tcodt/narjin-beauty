import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  getBusinessAppointments,
  getBusinessAppointment,
  updateBusinessAppointmentStatus,
} from "../../services/appointments/businessAppointments";
import { UpdateAppointmentBusinessPayload } from "../../types/appointments";
import { useAuth } from "../../context/AuthContext";

export const useBusinessAppointments = () => {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ["business-appointments"],
    queryFn: getBusinessAppointments,
    enabled: isAuthenticated,
  });
};

export const useBusinessAppointment = (id: number | undefined) => {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ["business-appointment", id],
    queryFn: () => getBusinessAppointment(id!),
    enabled: isAuthenticated && !!id && id > 0,
  });
};

export const useUpdateBusinessAppointmentStatus = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: UpdateAppointmentBusinessPayload;
    }) => updateBusinessAppointmentStatus(id, payload),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["business-appointments"] });
      qc.invalidateQueries({ queryKey: ["business-appointment", data.id] });
      qc.invalidateQueries({ queryKey: ["notifications"] });
      const label =
        data.status === "confirmed"
          ? "نوبت تأیید شد"
          : data.status === "canceled"
            ? "نوبت رد/لغو شد"
            : "وضعیت به‌روز شد";
      toast.success(label);
    },
    onError: () => toast.error("خطا در به‌روزرسانی نوبت"),
  });
};
