import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getManualPayments,
  createManualPayment,
  reviewManualPayment,
} from "../../services/payments/manualPayments";
import {
  CreateManualPaymentPayload,
  ReviewManualPaymentPayload,
} from "../../types/payments";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

export const useManualPayments = () => {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ["manual-payments"],
    queryFn: getManualPayments,
    enabled: isAuthenticated,
  });
};

export const useCreateManualPayment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateManualPaymentPayload) =>
      createManualPayment(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["manual-payments"] });
      toast.success("فیش با موفقیت ثبت شد");
    },
    onError: () => toast.error("خطا در ثبت فیش"),
  });
};

export const useReviewManualPayment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: ReviewManualPaymentPayload;
    }) => reviewManualPayment(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["manual-payments"] });
      toast.success("وضعیت فیش به‌روز شد");
    },
    onError: () => toast.error("خطا در بررسی فیش"),
  });
};
