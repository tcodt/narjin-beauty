import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { createManualPayment } from "../../services/payments/manualPayments";
import { CreateManualPaymentPayload } from "../../types/payments";

export const useCreateManualPayment = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateManualPaymentPayload) =>
      createManualPayment(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["manual-payments"] });
      toast.success("فیش با موفقیت ثبت شد. منتظر تأیید سالن بمانید.");
    },
    onError: () => toast.error("خطا در ثبت فیش"),
  });
};
