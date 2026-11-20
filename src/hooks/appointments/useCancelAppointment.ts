import { useMutation, useQueryClient } from "@tanstack/react-query";
import { cancelAppointment } from "../../services/appointments/cancelAppointment";
import toast from "react-hot-toast";
import { parseApiError } from "../../utils/parseApiError";

export const useCancelAppointment = (id: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => cancelAppointment(id),
    onSuccess: (data) => {
      const msg =
        (data as { message?: string })?.message ?? "رزرو با موفقیت لغو شد.";
      toast.success(msg);
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      queryClient.invalidateQueries({ queryKey: ["available-times"] });
      queryClient.invalidateQueries({ queryKey: ["slots"] });
    },
    onError: (error) => {
      toast.error(parseApiError(error));
    },
  });
};
