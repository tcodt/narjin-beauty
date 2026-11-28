import { useMutation } from "@tanstack/react-query";
import {
  resetPassword,
  type ResetPasswordPayload,
} from "../../../services/accounts/reset-password/resetPassword";

export const useResetPassword = () => {
  return useMutation({
    mutationFn: (payload: ResetPasswordPayload) => resetPassword(payload),
  });
};
