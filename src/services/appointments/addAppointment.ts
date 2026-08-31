import { ReservationRequest } from "../../types/appointments";
import api from "../../utils/api";

/**
 * Customer book — Swagger:
 * POST /reservations/{random_code}/book/
 */
export const addAppointment = async (bookingData: ReservationRequest) => {
  const code = bookingData.random_code?.trim();
  if (!code) {
    throw new Error("کد سالن مشخص نیست");
  }

  const payload = {
    service_id: Number(bookingData.service_id),
    employee_id: Number(bookingData.employee_id),
    time_slot_id: Number(bookingData.time_slot_id),
  };

  const response = await api.post(
    `/reservations/${encodeURIComponent(code)}/book/`,
    payload,
  );
  return response.data;
};
