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

function toPositiveInt(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value) && value > 0) {
    return Math.trunc(value);
  }
  if (typeof value === "string" && value.trim() !== "") {
    const n = Number(value);
    if (Number.isFinite(n) && n > 0) return Math.trunc(n);
  }
  return null;
}

function pickStartTime(
  s: Record<string, unknown>,
  keyFallback?: string,
): string | undefined {
  if (typeof s.start_time === "string" && s.start_time) return s.start_time;
  if (typeof s.time === "string" && s.time) return s.time;
  if (typeof s.start === "string" && s.start) return s.start;
  if (keyFallback && /^\d{1,2}:\d{2}/.test(keyFallback)) return keyFallback;
  return undefined;
}

/**
 * CRITICAL: never invent id (index+1).
 * Backend book needs real TimeSlot pk.
 * Your API returns: { slot_id, start_time, end_time }
 */
function normalizeSlot(
  raw: unknown,
  fallbackDate: string,
  keyFallback?: string,
): AvailableSlot | null {
  if (!raw || typeof raw !== "object") return null;

  const s = raw as Record<string, unknown>;

  // order matters — API uses slot_id
  const id =
    toPositiveInt(s.slot_id) ??
    toPositiveInt(s.id) ??
    toPositiveInt(s.time_slot_id) ??
    toPositiveInt(s.pk);

  if (id == null) {
    if (import.meta.env.DEV) {
      console.warn("[available-times] slot without real id skipped", raw);
    }
    return null;
  }

  const employeeId =
    toPositiveInt(s.employee_id) ??
    toPositiveInt(s.employee) ??
    (s.employee && typeof s.employee === "object"
      ? toPositiveInt((s.employee as Record<string, unknown>).id)
      : null);

  const serviceId =
    toPositiveInt(s.service_id) ??
    toPositiveInt(s.service) ??
    (s.service && typeof s.service === "object"
      ? toPositiveInt((s.service as Record<string, unknown>).id)
      : null);

  const isAvailable =
    typeof s.is_available === "boolean"
      ? s.is_available
      : typeof s.available === "boolean"
        ? s.available
        : true;

  return {
    id,
    date: typeof s.date === "string" && s.date ? s.date : fallbackDate,
    start_time: pickStartTime(s, keyFallback),
    end_time: typeof s.end_time === "string" ? s.end_time : undefined,
    is_available: isAvailable,
    service_id: serviceId ?? undefined,
    employee_id: employeeId ?? undefined,
    employee_name:
      typeof s.employee_name === "string"
        ? s.employee_name
        : s.employee && typeof s.employee === "object"
          ? String(
              (s.employee as Record<string, unknown>).name ??
                (s.employee as Record<string, unknown>).full_name ??
                "",
            ) || undefined
          : undefined,
  };
}

function collectFromArray(
  items: unknown[],
  fallbackDate: string,
): AvailableSlot[] {
  const out: AvailableSlot[] = [];
  for (const item of items) {
    const slot = normalizeSlot(item, fallbackDate);
    if (slot) out.push(slot);
  }
  return out;
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
      return collectFromArray(data, date);
    }

    if (data && typeof data === "object") {
      const obj = data as Record<string, unknown>;

      for (const key of [
        "slots",
        "results",
        "available_times",
        "times",
        "data",
      ] as const) {
        if (Array.isArray(obj[key])) {
          return collectFromArray(obj[key] as unknown[], date);
        }
      }

      const fromMap: AvailableSlot[] = [];
      for (const [key, value] of Object.entries(obj)) {
        if (value && typeof value === "object") {
          const slot = normalizeSlot(value, date, key);
          if (slot) fromMap.push(slot);
        }
      }
      return fromMap;
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
    throw err;
  }
};
