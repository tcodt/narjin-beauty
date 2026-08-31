import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  updateBusinessAppointment,
  UpdateBusinessAppointmentPayload,
} from "../../services/appointments/updateBusinessAppointment";

export const useUpdateBusinessAppointment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: UpdateBusinessAppointmentPayload;
    }) => updateBusinessAppointment(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["business-appointments"] });
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
};
