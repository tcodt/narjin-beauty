import { useMutation } from "@tanstack/react-query";
import { sendResetCode } from "../../../services/accounts/send-reset-code/sendResetCode";

export const useSendResetCode = () => {
  return useMutation({
    mutationFn: (phoneNumber: string) => sendResetCode(phoneNumber),
  });
};
