import api from "../../utils/api";

export const deleteNotification = async (id: number): Promise<void> => {
  await api.delete(`/notifications/${id}/delete/`);
};
