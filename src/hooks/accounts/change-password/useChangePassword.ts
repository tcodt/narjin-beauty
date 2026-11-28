import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { changePassword } from "../../../services/accounts/change-password/changePassword";
import type { ChangePasswordType } from "../../../types/change-password-type";
import { parseApiError } from "../../../utils/parseApiError";

export const useChangePassword = () => {
  return useMutation({
    mutationFn: (payload: ChangePasswordType) => changePassword(payload),
    onSuccess: () => {
      toast.success("رمز عبور با موفقیت تغییر کرد");
    },
    onError: (error: unknown) => {
      const msg =
        parseApiError(error) || "تغییر رمز عبور ناموفق بود. دوباره تلاش کنید.";
      toast.error(msg);
    },
  });
};
