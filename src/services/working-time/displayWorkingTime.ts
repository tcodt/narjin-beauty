import { WorkTimePromise } from "../../types/working-time";
import api from "../../utils/api";

/**
 * صفحه عمومی سالن (مشتری) — بدون توکن
 * Backend: GET /working_hours/user/<code>/
 * Response shape جدید:
 * { weekly, special_days, holidays }
 *
 * مسیر قدیمی GET /working_hours/user/ بدون code → 400
 */
export const displayWorkingTime = async (
  code: string,
): Promise<WorkTimePromise> => {
  if (!code?.trim()) {
    throw new Error("کد سالن الزامی است");
  }
  const response = await api.get(`/working_hours/user/${code.trim()}/`);
  return response.data;
};
