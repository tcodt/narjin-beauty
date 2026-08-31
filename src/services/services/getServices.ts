import { GetServices } from "../../types/services";
import api from "../../utils/api";

/** Owner panel — GET /business/services/ */
export const getOwnerServices = async (): Promise<GetServices> => {
  const response = await api.get("/business/services/");
  const data = response.data;
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.results)) return data.results;
  return [];
};

/**
 * Customer catalog — Swagger:
 * GET /business/services/user/{random_code}/
 *
 * Do NOT call GET /business/services/ (403 for customers).
 * Do NOT use packages for the reserve list.
 */
export const getCustomerServices = async (
  randomCode: string,
): Promise<GetServices> => {
  const code = randomCode.trim();
  if (!code) return [];

  const response = await api.get(
    `/business/services/user/${encodeURIComponent(code)}/`,
  );

  const data = response.data;
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.results)) return data.results;
  return [];
};
