import api from "../../utils/api";
import { AppNotification, AppNotifications } from "../../types/notifications";

function normalizeOne(raw: unknown): AppNotification | null {
  if (!raw || typeof raw !== "object") return null;
  const n = raw as Record<string, unknown>;
  const id = typeof n.id === "number" ? n.id : Number(n.id);
  if (!Number.isFinite(id) || id <= 0) return null;

  return {
    id,
    notification_type: String(n.notification_type ?? "general"),
    title: typeof n.title === "string" ? n.title : "اعلان",
    message: typeof n.message === "string" ? n.message : "",
    is_read: Boolean(n.is_read),
    created_at:
      typeof n.created_at === "string"
        ? n.created_at
        : new Date().toISOString(),
    appointment:
      typeof n.appointment === "number"
        ? n.appointment
        : n.appointment == null
          ? null
          : Number(n.appointment) || null,
  };
}

export const getNotifications = async (params?: {
  is_read?: boolean;
}): Promise<AppNotifications> => {
  const response = await api.get("/notifications/", {
    params:
      params?.is_read === undefined ? undefined : { is_read: params.is_read },
  });

  const data = response.data;
  const list = Array.isArray(data)
    ? data
    : Array.isArray(data?.results)
      ? data.results
      : Array.isArray(data?.notifications)
        ? data.notifications
        : [];

  return list.map(normalizeOne).filter(Boolean) as AppNotification[];
};
