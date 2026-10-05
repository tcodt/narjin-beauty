import api from "../../utils/api";

export const updateBusinessLogo = async (file: File) => {
  const form = new FormData();
  form.append("logo", file);
  const { data } = await api.patch("/business/me/", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};
