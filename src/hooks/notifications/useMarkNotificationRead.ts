import { useMutation, useQueryClient } from "@tanstack/react-query";
import { markNotificationRead } from "../../services/notifications/markNotificationRead";

export const useMarkNotificationRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => markNotificationRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
};
