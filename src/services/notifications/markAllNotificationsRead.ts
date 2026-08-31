import api from "../../utils/api";

export const markAllNotificationsRead = async (): Promise<void> => {
  await api.post("/notifications/mark-all-read/");
};
