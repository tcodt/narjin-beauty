import api from "../../utils/api";

/**
 * لغو نوبت توسط مشتری
 * Backend: POST /reservations/my-appointments/<id>/cancel/
 * Success: 200 { message }
 * Already canceled: 400 { error }
 */
export const cancelAppointment = async (id: number) => {
  const response = await api.post(
    `/reservations/my-appointments/${id}/cancel/`,
  );
  return response.data;
};
