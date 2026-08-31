import api from "../../utils/api";
import { AxiosError } from "axios";

export type AvailableSlot = {
  id: number;
  date?: string;
  start_time?: string;
  end_time?: string;
  is_available?: boolean;
  service?: number;
  service_id?: number;
  employee_id?: number;
  employee_name?: string;
  [key: string]: unknown;
};

function normalizeSlot(
  raw: unknown,
  index: number,
  fallbackDate: string,
): AvailableSlot {
  if (!raw || typeof raw !== "object") {
    return { id: index + 1, date: fallbackDate, is_available: true };
  }
  const s = raw as Record<string, unknown>;
  const id =
    typeof s.id === "number"
      ? s.id
      : typeof s.time_slot_id === "number"
        ? (s.time_slot_id as number)
        : index + 1;

  return {
    id,
    date: typeof s.date === "string" ? s.date : fallbackDate,
    start_time:
      typeof s.start_time === "string"
        ? s.start_time
        : typeof s.time === "string"
          ? s.time
          : undefined,
    end_time: typeof s.end_time === "string" ? s.end_time : undefined,
    is_available: typeof s.is_available === "boolean" ? s.is_available : true,
    service_id:
      typeof s.service_id === "number"
        ? s.service_id
        : typeof s.service === "number"
          ? s.service
          : undefined,
    employee_id: typeof s.employee_id === "number" ? s.employee_id : undefined,
    employee_name:
      typeof s.employee_name === "string" ? s.employee_name : undefined,
  };
}

export const getAvailableTimes = async (
  date: string,
  serviceId: number,
): Promise<AvailableSlot[]> => {
  try {
    const response = await api.get("/business/available-times/", {
      params: { date, service_id: serviceId },
    });

    const data = response.data;
    if (import.meta.env.DEV) {
      console.log("[available-times]", { date, serviceId, data });
    }

    if (Array.isArray(data)) {
      return data.map((item, i) => normalizeSlot(item, i, date));
    }
    if (Array.isArray(data?.slots)) {
      return data.slots.map((item: unknown, i: number) =>
        normalizeSlot(item, i, date),
      );
    }
    if (Array.isArray(data?.results)) {
      return data.results.map((item: unknown, i: number) =>
        normalizeSlot(item, i, date),
      );
    }
    if (Array.isArray(data?.available_times)) {
      return data.available_times.map((item: unknown, i: number) =>
        normalizeSlot(item, i, date),
      );
    }

    if (data && typeof data === "object") {
      return Object.entries(data).map(([key, value], index) => {
        if (value && typeof value === "object") {
          const slot = normalizeSlot(value, index, date);
          return { ...slot, start_time: slot.start_time ?? key };
        }
        return {
          id: index + 1,
          date,
          start_time: key,
          is_available: Boolean(value),
        };
      });
    }

    return [];
  } catch (err) {
    const ax = err as AxiosError;
    console.error("[available-times] failed", {
      date,
      serviceId,
      status: ax.response?.status,
      data: ax.response?.data,
    });
    // Re-throw so UI can show error; or return [] if you prefer silent empty
    throw err;
  }
};
