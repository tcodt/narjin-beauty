import { useMutation, useQueryClient } from "@tanstack/react-query";
import { cancelAppointment } from "../../services/appointments/cancelAppointment";
import toast from "react-hot-toast";
import { AxiosError } from "axios";

type ApiErrorBody = {
  message?: string;
  error?: string;
  detail?: string;
};

export const useCancelAppointment = (id: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => cancelAppointment(id),
    onSuccess: (data) => {
      const msg =
        (data as { message?: string })?.message ?? "رزرو با موفقیت لغو شد.";
      toast.success(msg);
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      queryClient.invalidateQueries({ queryKey: ["slots"] });
    },
    onError: (error: AxiosError<ApiErrorBody>) => {
      const status = error.response?.status;
      const body = error.response?.data;

      if (status === 400) {
        toast.error(
          body?.error || body?.message || "این رزرو قبلاً لغو شده است.",
        );
        return;
      }
      if (status === 405) {
        toast.error("تغییر وضعیت از این مسیر مجاز نیست. از لغو استفاده کنید.");
        return;
      }
      toast.error(body?.detail || "خطا در لغو رزرو. لطفاً دوباره تلاش کنید.");
    },
  });
};
