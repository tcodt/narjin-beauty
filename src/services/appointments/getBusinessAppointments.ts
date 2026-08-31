import api from "../../utils/api";

export type BusinessAppointment = {
  id: number;
  status: "pending" | "confirmed" | "canceled" | string;
  customer_name: string;
  customer_phone: string;
  service_name: string;
  employee_name: string;
  date: string;
  start_time: string;
  end_time?: string;
  reminder_sent?: boolean;
};

export const getBusinessAppointments = async (): Promise<
  BusinessAppointment[]
> => {
  const response = await api.get("/reservations/business/appointments/");
  return Array.isArray(response.data) ? response.data : [];
};
