import api from "../../utils/api";
import { BusinessMeResponse } from "../../types/business";

export const updateBusinessLogo = async (
  file: File,
): Promise<BusinessMeResponse> => {
  const form = new FormData();
  form.append("logo", file);
  const { data } = await api.patch("/business/me/", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};

export const getBusinessMe = async (): Promise<BusinessMeResponse> => {
  const { data } = await api.get("/business/me/");
  return data;
};
