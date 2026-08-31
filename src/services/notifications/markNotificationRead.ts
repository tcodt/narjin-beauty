import api from "../../utils/api";

export const markNotificationRead = async (id: number): Promise<void> => {
  await api.post(`/notifications/${id}/read/`);
};
