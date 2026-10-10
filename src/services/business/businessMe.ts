import api from "../../utils/api";
import { BusinessMeResponse } from "../../types/business";

export const getBusinessMe = async (): Promise<BusinessMeResponse> => {
  const { data } = await api.get("/business/me/");
  return data;
};

/**
 * /business/me/ فقط GET است.
 * آپلود لوگو: PATCH /business/{id}/  (multipart)
 */
export const updateBusinessLogo = async (
  businessId: number,
  file: File,
): Promise<BusinessMeResponse> => {
  const form = new FormData();
  form.append("logo", file);

  const { data } = await api.patch(`/business/${businessId}/`, form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};
