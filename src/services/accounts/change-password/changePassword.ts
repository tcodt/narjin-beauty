import api from "../../../utils/api";
import type { ChangePasswordType } from "../../../types/change-password-type";

export const changePassword = async (payload: ChangePasswordType) => {
  const { data } = await api.post("/accounts/change-password/", {
    old_password: payload.old_password,
    new_password: payload.new_password,
    confirm_password: payload.confirm_password,
  });
  return data;
};
