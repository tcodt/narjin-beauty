import api from "../../../utils/api";

export const verifyResetCode = async ({
  phoneNumber,
  code,
}: {
  phoneNumber: string;
  code: string;
}) => {
  const { data } = await api.post("/accounts/verify-reset-code/", {
    phone_number: phoneNumber,
    code,
  });
  return data;
};
