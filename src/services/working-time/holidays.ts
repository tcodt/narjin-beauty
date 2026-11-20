import api from "../../utils/api";
import type { Holiday } from "../../types/working-time";

export const getHolidays = async (): Promise<Holiday[]> => {
  const { data } = await api.get("/working_hours/holidays/");
  return data;
};

export const createHoliday = async (payload: {
  date: string;
  title?: string;
}): Promise<Holiday> => {
  const { data } = await api.post("/working_hours/holidays/", payload);
  return data;
};

export const deleteHoliday = async (id: number): Promise<void> => {
  await api.delete(`/working_hours/holidays/${id}/`);
};
