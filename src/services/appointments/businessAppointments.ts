import api from "../../utils/api";
import {
  AppointmentBusiness,
  UpdateAppointmentBusinessPayload,
} from "../../types/appointments";

function normalizeOne(raw: unknown): AppointmentBusiness | null {
  if (!raw || typeof raw !== "object") return null;
  const a = raw as Record<string, unknown>;
  const id = typeof a.id === "number" ? a.id : Number(a.id);
  if (!Number.isFinite(id) || id <= 0) return null;

  const status = String(a.status ?? "pending") as AppointmentBusiness["status"];

  return {
    id,
    status:
      status === "confirmed" || status === "canceled" ? status : "pending",
    customer_name: String(a.customer_name ?? "—"),
    customer_phone: String(a.customer_phone ?? "—"),
    service_name: String(a.service_name ?? "—"),
    employee_name: String(a.employee_name ?? "—"),
    date: String(a.date ?? ""),
    start_time: String(a.start_time ?? ""),
    end_time: String(a.end_time ?? ""),
    reminder_sent: Boolean(a.reminder_sent),
  };
}

export const getBusinessAppointments = async (): Promise<
  AppointmentBusiness[]
> => {
  const { data } = await api.get("/reservations/business/appointments/");
  const list = Array.isArray(data)
    ? data
    : Array.isArray(data?.results)
      ? data.results
      : [];
  return list.map(normalizeOne).filter(Boolean) as AppointmentBusiness[];
};

export const getBusinessAppointment = async (
  id: number,
): Promise<AppointmentBusiness> => {
  const { data } = await api.get(`/reservations/business/appointments/${id}/`);
  const item = normalizeOne(data);
  if (!item) throw new Error("نوبت یافت نشد");
  return item;
};

/** تأیید / رد نوبت */
export const updateBusinessAppointmentStatus = async (
  id: number,
  payload: UpdateAppointmentBusinessPayload,
): Promise<AppointmentBusiness> => {
  const { data } = await api.patch(
    `/reservations/business/appointments/${id}/update/`,
    payload,
  );
  const item = normalizeOne(data);
  if (!item) throw new Error("به‌روزرسانی ناموفق");
  return item;
};
