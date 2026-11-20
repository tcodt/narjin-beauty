import api from "../../utils/api";
import type { PublicWorkingHoursResponse } from "../../types/working-time";

export const displayWorkingTime = async (
  code: string,
): Promise<PublicWorkingHoursResponse> => {
  if (!code?.trim()) throw new Error("کد سالن الزامی است");
  const { data } = await api.get(`/working_hours/user/${code.trim()}/`);
  return data;
};
