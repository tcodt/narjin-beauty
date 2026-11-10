import api from "../../utils/api";

/**
 * لغو با DELETE (معادل cancel)
 * Backend: DELETE /reservations/my-appointments/<id>/ → 204 No Content
 */
export const removeAppointment = async (id: number): Promise<void> => {
  await api.delete(`/reservations/my-appointments/${id}/`);
};
