import api from "../../utils/api";
import { BusinessAppointment } from "./getBusinessAppointments";

export type BusinessAppointmentStatus = "pending" | "confirmed" | "canceled";

export type UpdateBusinessAppointmentPayload = {
  status: BusinessAppointmentStatus;
  /** optional fields if backend accepts them on update */
  service_name?: string;
  date?: string;
  start_time?: string;
};

export const updateBusinessAppointment = async (
  id: number,
  payload: UpdateBusinessAppointmentPayload,
): Promise<BusinessAppointment> => {
  // Swagger: PUT/PATCH /reservations/business/appointments/{id}/update/
  // description: تایید/رد نوبت توسط صاحب آرایشگاه
  const response = await api.patch(
    `/reservations/business/appointments/${id}/update/`,
    payload,
  );
  return response.data;
};
