import api from "../../../utils/api";

export const sendResetCode = async (phoneNumber: string) => {
  const { data } = await api.post("/accounts/send-reset-code/", {
    phone_number: phoneNumber,
  });
  return data;
};
