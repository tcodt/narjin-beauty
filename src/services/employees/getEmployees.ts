import { GetEmployees } from "../../types/employees";
import api from "../../utils/api";

/**
 * Owner employees only (scoped by token).
 * Prefer /mine/, fallback to list endpoint.
 */
export const getEmployees = async (): Promise<GetEmployees> => {
  try {
    const res = await api.get("/business/employees/mine/");
    return Array.isArray(res.data) ? res.data : [];
  } catch (err: unknown) {
    const status = (err as { response?: { status?: number } })?.response
      ?.status;
    if (status === 404 || status === 403) {
      const res = await api.get("/business/employees/");
      return Array.isArray(res.data) ? res.data : [];
    }
    throw err;
  }
};
