import api from "../../utils/api";

export const getUnreadCount = async (): Promise<number> => {
  const response = await api.get("/notifications/unread-count/");
  const data = response.data;

  if (typeof data === "number" && Number.isFinite(data))
    return Math.max(0, data);
  if (typeof data === "string" && data.trim() !== "") {
    const n = Number(data);
    if (Number.isFinite(n)) return Math.max(0, n);
  }
  if (data && typeof data === "object") {
    const obj = data as Record<string, unknown>;
    for (const key of ["count", "unread_count", "unread", "total"] as const) {
      const v = obj[key];
      if (typeof v === "number" && Number.isFinite(v)) return Math.max(0, v);
      if (typeof v === "string") {
        const n = Number(v);
        if (Number.isFinite(n)) return Math.max(0, n);
      }
    }
  }
  return 0;
};
