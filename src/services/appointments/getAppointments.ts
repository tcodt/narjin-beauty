import { Appointments } from "../../types/appointments";
import api from "../../utils/api";

/** Customer: my bookings */
export const getAppointments = async (): Promise<Appointments> => {
  const response = await api.get("/reservations/my-appointments/");
  return Array.isArray(response.data) ? response.data : [];
};
