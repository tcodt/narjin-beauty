import api from "../../utils/api";
import type {
  WeeklyWorkingHour,
  WeeklyUpsertPayload,
  WeeklyUpsertItem,
} from "../../types/working-time";

export const getWeeklySchedule = async (): Promise<WeeklyWorkingHour[]> => {
  const { data } = await api.get("/working_hours/weekly/");
  return data;
};

export const upsertWeeklySchedule = async (
  payload: WeeklyUpsertPayload,
): Promise<WeeklyWorkingHour | WeeklyWorkingHour[]> => {
  const { data } = await api.post("/working_hours/weekly/", payload);
  return data;
};

export const updateWeeklyDay = async (
  id: number,
  payload: Partial<WeeklyUpsertItem>,
): Promise<WeeklyWorkingHour> => {
  const { data } = await api.patch(`/working_hours/weekly/${id}/`, payload);
  return data;
};

export const deleteWeeklyDay = async (id: number): Promise<void> => {
  await api.delete(`/working_hours/weekly/${id}/`);
};
