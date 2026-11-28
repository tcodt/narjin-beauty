import api from "../../../utils/api";

export type ResetPasswordPayload = {
  phoneNumber: string;
  code: string;
  password: string;
};

export const resetPassword = async ({
  phoneNumber,
  code,
  password,
}: ResetPasswordPayload) => {
  const { data } = await api.post("/accounts/reset-password/", {
    phone_number: phoneNumber,
    code,
    password,
  });
  return data;
};
