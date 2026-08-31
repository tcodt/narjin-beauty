import api from "../../utils/api";
import { BroadcastNotificationPayload } from "../../types/notifications";

export const broadcastNotification = async (
  payload: BroadcastNotificationPayload,
) => {
  const response = await api.post("/notifications/broadcast/", payload);
  return response.data;
};
